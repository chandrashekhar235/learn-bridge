import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const StudyRoom = () => {
  const { roomId } = useParams();
  const localVideo = useRef();
  const peersRef = useRef({});
  const [stream, setStream] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(currentStream => {
        setStream(currentStream);
        localVideo.current.srcObject = currentStream;

        socket.emit("join-room", roomId);

        socket.on("user-joined", userId => {
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

        socket.on("user-left", userId => {
          if (peersRef.current[userId]) {
            peersRef.current[userId].destroy();
            delete peersRef.current[userId];
          }
        });
      });
  }, [roomId]);

  const createPeer = (userId, stream) => {
    const Peer = require("simple-peer");
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream
    });

    peer.on("signal", signal => {
      socket.emit("signal", { to: userId, signal });
    });

    peer.on("stream", userStream => {
      setUsers(prev => [...prev, userStream]);
    });

    return peer;
  };

  const addPeer = (signal, userId, stream) => {
    const Peer = require("simple-peer");
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream
    });

    peer.signal(signal);

    peer.on("signal", signal => {
      socket.emit("signal", { to: userId, signal });
    });

    peer.on("stream", userStream => {
      setUsers(prev => [...prev, userStream]);
    });

    return peer;
  };

  const toggleVideo = () => {
    stream.getVideoTracks()[0].enabled =
      !stream.getVideoTracks()[0].enabled;
  };

  const toggleMic = () => {
    stream.getAudioTracks()[0].enabled =
      !stream.getAudioTracks()[0].enabled;
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      <div className="flex-1 grid grid-cols-3 gap-2 p-4">
        <video ref={localVideo} autoPlay muted className="rounded" />
        {users.map((userStream, i) => (
          <video
            key={i}
            autoPlay
            ref={video => video && (video.srcObject = userStream)}
            className="rounded"
          />
        ))}
      </div>

      <div className="p-4 flex justify-center gap-4 bg-gray-900">
        <button onClick={toggleMic}>🎤</button>
        <button onClick={toggleVideo}>📷</button>
        <button onClick={() => window.location.href = "/"}>❌</button>
      </div>
    </div>
  );
};

export default StudyRoom;
