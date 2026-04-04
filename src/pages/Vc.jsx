import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Peer from "simple-peer";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "https://learn-bridge-backend.onrender.com";

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true,
});

const StudyRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const localVideo = useRef(null);
  const peersRef = useRef({});

  const [stream, setStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer for session duration
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  useEffect(() => {
    let currentStream;

    const init = async () => {
      try {
        currentStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        setStream(currentStream);

        if (localVideo.current) {
          localVideo.current.srcObject = currentStream;
        }

        socket.emit("join-room", roomId);

        socket.on("user-joined", (userId) => {
          const peer = createPeer(userId, currentStream);
          peersRef.current[userId] = peer;
        });

        socket.on("signal", ({ from, signal }) => {
          if (!peersRef.current[from]) {
            const peer = addPeer(signal, from, currentStream);
            peersRef.current[from] = peer;
          } else {
            peersRef.current[from].signal(signal);
          }
        });

        socket.on("user-left", (userId) => {
          if (peersRef.current[userId]) {
            peersRef.current[userId].destroy();
            delete peersRef.current[userId];

            setRemoteStreams((prev) =>
              prev.filter((s) => s.id !== userId)
            );
          }
        });
      } catch (err) {
        console.error("Camera/Mic error:", err);
        alert("Could not access camera or microphone. Please check permissions.");
      }
    };

    init();

    return () => {
      socket.off("user-joined");
      socket.off("signal");
      socket.off("user-left");

      Object.values(peersRef.current).forEach((peer) => peer.destroy());
      peersRef.current = {};

      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [roomId]);

  const createPeer = (userId, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("signal", { to: userId, signal });
    });

    peer.on("stream", (userStream) => {
      setRemoteStreams((prev) => {
        if (prev.find((p) => p.id === userId)) return prev;
        return [...prev, { id: userId, stream: userStream }];
      });
    });

    return peer;
  };

  const addPeer = (signal, userId, stream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.signal(signal);

    peer.on("signal", (signal) => {
      socket.emit("signal", { to: userId, signal });
    });

    peer.on("stream", (userStream) => {
      setRemoteStreams((prev) => {
        if (prev.find((p) => p.id === userId)) return prev;
        return [...prev, { id: userId, stream: userStream }];
      });
    });

    return peer;
  };

  const toggleMic = () => {
    if (!stream) return;
    const track = stream.getAudioTracks()[0];
    track.enabled = !track.enabled;
    setMicOn(track.enabled);
  };

  const toggleVideo = () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    track.enabled = !track.enabled;
    setVideoOn(track.enabled);
  };

  const toggleScreenShare = async () => {
    if (!stream) return;

    if (!screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        const screenTrack = screenStream.getVideoTracks()[0];

        // Replace track in all peers
        Object.values(peersRef.current).forEach((peer) => {
          const sender = peer._pc
            ?.getSenders()
            .find((s) => s.track?.kind === "video");
          if (sender) sender.replaceTrack(screenTrack);
        });

        // Show screen in local video
        if (localVideo.current) {
          localVideo.current.srcObject = screenStream;
        }

        screenTrack.onended = () => {
          // Revert to camera
          const camTrack = stream.getVideoTracks()[0];
          Object.values(peersRef.current).forEach((peer) => {
            const sender = peer._pc
              ?.getSenders()
              .find((s) => s.track?.kind === "video");
            if (sender) sender.replaceTrack(camTrack);
          });
          if (localVideo.current) {
            localVideo.current.srcObject = stream;
          }
          setScreenSharing(false);
        };

        setScreenSharing(true);
      } catch (err) {
        console.error("Screen share error:", err);
      }
    } else {
      // Stop screen sharing, revert to camera
      const camTrack = stream.getVideoTracks()[0];
      Object.values(peersRef.current).forEach((peer) => {
        const sender = peer._pc
          ?.getSenders()
          .find((s) => s.track?.kind === "video");
        if (sender) sender.replaceTrack(camTrack);
      });
      if (localVideo.current) {
        localVideo.current.srcObject = stream;
      }
      setScreenSharing(false);
    }
  };

  const leaveRoom = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    Object.values(peersRef.current).forEach((peer) => peer.destroy());
    peersRef.current = {};

    socket.emit("leave-room", roomId);

    navigate("/vc");
  };

  const totalParticipants = remoteStreams.length + 1;

  const getGridCols = () => {
    if (totalParticipants === 1) return "grid-cols-1";
    if (totalParticipants === 2) return "grid-cols-1 sm:grid-cols-2";
    if (totalParticipants <= 4) return "grid-cols-2";
    return "grid-cols-2 sm:grid-cols-3";
  };

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Top Bar */}
      <div className="px-4 py-2 bg-gray-900/80 backdrop-blur-sm flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm text-gray-400">
            Room: <span className="text-white font-medium">{roomId.slice(0, 8)}...</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            ⏱ {formatTime(elapsedTime)}
          </span>
          <span className="text-sm text-gray-500">
            👥 {totalParticipants} {totalParticipants === 1 ? "person" : "people"}
          </span>
        </div>
      </div>

      {/* Video Section */}
      <div className={`flex-1 grid ${getGridCols()} gap-2 p-2 sm:gap-3 sm:p-3`}>
        {/* Local Video — NOT mirrored (real view) */}
        <div className="relative rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
          <video
            ref={localVideo}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {/* "You" label */}
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-gray-300 flex items-center gap-1">
            <span>You</span>
            {!micOn && <span className="text-red-400">🔇</span>}
            {!videoOn && <span className="text-red-400">📷</span>}
          </div>
          {/* Video off overlay */}
          {!videoOn && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold">
                You
              </div>
            </div>
          )}
        </div>

        {/* Remote Videos */}
        {remoteStreams.map(({ id, stream: remoteStream }) => (
          <div
            key={id}
            className="relative rounded-xl overflow-hidden bg-gray-900 border border-gray-800"
          >
            <video
              autoPlay
              playsInline
              ref={(video) => {
                if (video) video.srcObject = remoteStream;
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-gray-300">
              Participant
            </div>
          </div>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="px-4 py-3 flex flex-wrap justify-center gap-3 bg-gray-900/80 backdrop-blur-sm border-t border-white/5">
        <button
          onClick={toggleMic}
          className={`px-4 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 transition-all ${
            micOn
              ? "bg-gray-700 hover:bg-gray-600 text-white"
              : "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
          }`}
        >
          {micOn ? "🎤" : "🔇"} {micOn ? "Mic" : "Muted"}
        </button>

        <button
          onClick={toggleVideo}
          className={`px-4 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 transition-all ${
            videoOn
              ? "bg-gray-700 hover:bg-gray-600 text-white"
              : "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
          }`}
        >
          {videoOn ? "📷" : "🚫"} {videoOn ? "Camera" : "Camera Off"}
        </button>

        <button
          onClick={toggleScreenShare}
          className={`px-4 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 transition-all ${
            screenSharing
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
              : "bg-gray-700 hover:bg-gray-600 text-white"
          }`}
        >
           {screenSharing ? "Stop Share" : "Share Screen"}
        </button>

        <button
          onClick={leaveRoom}
          className="px-5 py-2.5 rounded-full bg-red-700 hover:bg-red-800 font-medium text-sm flex items-center gap-2 transition-all shadow-lg shadow-red-700/20"
        >
           Leave
        </button>
      </div>
    </div>
  );
};

export default StudyRoom;