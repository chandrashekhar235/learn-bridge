import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../config";

const VcLanding = () => {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch public rooms
  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/vc/public`);
      setRooms(res.data);
    } catch (err) {
      console.error("Fetch error:", err.response || err.message);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // 🔹 Create room
  const createRoom = async () => {
    if (!roomName.trim()) {
      alert("Enter a room name");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
  `${BASE_URL}/vc/create`,
  {
    name: roomName,
    isPrivate,
  },
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);

      navigate(`/vc/${res.data._id}`);

      fetchRooms();
      setRoomName("");
      setIsPrivate(false);

    } catch (err) {
      console.error("Create error:", err.response || err.message);
      alert("Error creating room");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete room
  const deleteRoom = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/vc/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      fetchRooms();

    } catch (err) {
      console.error("Delete error:", err.response || err.message);
      alert("Not allowed or error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 sm:p-6">

      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10">
        🎙 Voice Channels
      </h1>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10">

        {/* 🔹 LEFT SIDE - ROOM LIST */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Public Channels</h2>

          {rooms.length === 0 ? (
            <p className="text-gray-400">No public voice channels yet.</p>
          ) : (
            rooms.map((room) => (
              <div
                key={room._id}
                className="bg-gray-800 p-4 rounded-xl mb-3 flex justify-between items-center hover:bg-gray-700"
              >
                <p
                  onClick={() => navigate(`/vc/${room._id}`)}
                  className="cursor-pointer font-medium"
                >
                  {room.name}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 🔥 prevent navigation
                    deleteRoom(room._id);
                  }}
                  className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        {/* 🔹 RIGHT SIDE - CREATE ROOM */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-6">Create New VC</h2>

          <input
            type="text"
            placeholder="Enter room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg text-black mb-4"
          />

          <label className="flex items-center gap-2 mb-6">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={() => setIsPrivate(!isPrivate)}
            />
            Private Channel
          </label>

          <button
            onClick={createRoom}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl font-semibold"
          >
            {loading ? "Creating..." : "Create Channel"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default VcLanding;