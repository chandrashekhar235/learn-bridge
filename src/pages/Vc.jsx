import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Peer from "simple-peer";

import BASE_URL from "../config";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "https://learn-bridge-backend.onrender.com";

const socket = io(SOCKET_URL);

const StudyRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const localVideo = useRef(null);
  const peersRef = useRef({});

  const [stream, setStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

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
      }
    };

    init();

    // CLEANUP (Very Important)
    return () => {
      socket.off("user-joined");
      socket.off("signal");
      socket.off("user-left");

      Object.values(peersRef.current).forEach((peer) => peer.destroy());

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
      setRemoteStreams((prev) => [
        ...prev,
        { id: userId, stream: userStream },
      ]);
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
      setRemoteStreams((prev) => [
        ...prev,
        { id: userId, stream: userStream },
      ]);
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

  const leaveRoom = () => {
    navigate("/");
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col">

      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">

        {/* Local Video */}
        <video
          ref={localVideo}
          autoPlay
          muted
          className="rounded-xl border border-gray-700"
        />

        {/* Remote Videos */}
        {remoteStreams.map(({ id, stream }) => (
          <video
            key={id}
            autoPlay
            ref={(video) => {
              if (video) video.srcObject = stream;
            }}
            className="rounded-xl border border-gray-700"
          />
        ))}
      </div>

      {/* Controls */}
      <div className="p-4 flex justify-center gap-6 bg-gray-900">

        <button
          onClick={toggleMic}
          className={`px-4 py-2 rounded-lg ${
            micOn ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {micOn ? "Mic On 🎤" : "Mic Off 🔇"}
        </button>

        <button
          onClick={toggleVideo}
          className={`px-4 py-2 rounded-lg ${
            videoOn ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {videoOn ? "Camera On 📷" : "Camera Off 🚫"}
        </button>

        <button
          onClick={leaveRoom}
          className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800"
        >
          Leave ❌
        </button>

      </div>
    </div>
  );
};

export default StudyRoom;