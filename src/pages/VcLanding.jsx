import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const VcLanding = () => {
  const navigate = useNavigate();
  const [roomInput, setRoomInput] = useState("");

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 9);
    navigate(`/vc/${newRoomId}`);
  };

  const joinRoom = () => {
    if (!roomInput) return;
    navigate(`/vc/${roomInput}`);
  };

  return (
    <div className="min-h-screen bg-gradient from-black to-gray-900 text-white flex flex-col items-center justify-center p-6">

      <h1 className="text-4xl font-bold mb-10">
        Voice Chat Rooms
      </h1>

      <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-md space-y-6 shadow-xl">

        <button
          onClick={createRoom}
          className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl"
        >
          ➕ Create New Room
        </button>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            className="px-4 py-2 rounded-lg text-black"
          />

          <button
            onClick={joinRoom}
            className="bg-blue-600 hover:bg-blue-700 py-2 rounded-xl"
          >
            🔗 Join Room
          </button>
        </div>

      </div>

    </div>
  );
};

export default VcLanding;