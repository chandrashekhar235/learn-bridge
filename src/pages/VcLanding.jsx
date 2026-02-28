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

  // Fetch public rooms
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

  // Create room
  const createRoom = async () => {
    if (!roomName.trim()) {
      alert("Enter a room name");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${BASE_URL}/vc/create`, {
        name: roomName,
        isPrivate,
      });

      if (!res.data || !res.data._id) {
        alert("Room created but ID missing");
        return;
      }

      // Navigate to room
      navigate(`/vc/${res.data._id}`);

      // Optional: refresh room list
      fetchRooms();

      // Reset input
      setRoomName("");
      setIsPrivate(false);

    } catch (err) {
      console.error("Create error:", err.response || err.message);
      alert("Server not reachable or CORS issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">

      <h1 className="text-3xl font-bold text-center mb-10">
        🎙 Voice Channels
      </h1>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10">

        {/* LEFT SIDE */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Public Channels</h2>

          {rooms.length === 0 ? (
            <p className="text-gray-400">No public voice channels yet.</p>
          ) : (
            rooms.map((room) => (
              <div
                key={room._id}
                onClick={() => navigate(`/vc/${room._id}`)}
                className="bg-gray-800 p-4 rounded-xl mb-3 cursor-pointer hover:bg-gray-700"
              >
                <p className="font-medium">{room.name}</p>
              </div>
            ))
          )}
        </div>

        {/* RIGHT SIDE */}
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
            type="button"
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