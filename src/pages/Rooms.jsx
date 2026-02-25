import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:7777";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API}/groups`);
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    }
  };


  const joinRoom = (roomId) => {
    navigate(`/studyroom/${roomId}`);
  };
  const requestAccess = async (roomId) => {
  try {
    const token = localStorage.getItem("token");

    await axios.post(
      `${API}/groups/${roomId}/request`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Request Sent!");
  } catch (err) {
    console.error(err);
    alert("Error sending request");
  }
};

  return (
    <div className="min-h-screen bg-gradient from-gray-900 to-black text-white p-8">
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Study Rooms</h1>
        <button
          onClick={() => navigate("/create-group")}
          className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Create Room
        </button>
      </div>

      {/* Public Rooms */}
      <h2 className="text-xl mb-4 text-green-400">Public Rooms</h2>
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {rooms.filter(r => r.type === "public").map(room => (
          <div
            key={room._id}
            className="bg-gray-800 p-6 rounded-xl shadow-lg hover:scale-105 transition"
          >
            <h3 className="text-lg font-semibold mb-2">{room.name}</h3>
            <p className="text-gray-400 mb-3">{room.description}</p>
            <p className="text-sm text-gray-500 mb-4">
              Members: {room.membersCount}
            </p>
            <button
              onClick={() => joinRoom(room._id)}
              className="w-full bg-green-600 py-2 rounded-lg hover:bg-green-700"
            >
              Join
            </button>
          </div>
        ))}
      </div>
      {room.createdBy === currentUserName && (
  <button
    onClick={() => navigate(`/groups/${room._id}/admin`)}
    className="w-full bg-blue-600 py-2 rounded-lg mt-2 hover:bg-blue-700"
  >
    Manage
  </button>
)}

      {/* Private Rooms */}
      <h2 className="text-xl mb-4 text-yellow-400">Private Rooms</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {rooms.filter(r => r.type === "private").map(room => (
          <div
            key={room._id}
            className="bg-gray-800 p-6 rounded-xl shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-2">{room.name}</h3>
            <p className="text-gray-400 mb-3">{room.description}</p>
            <p className="text-sm text-gray-500 mb-4">
              Members: {room.membersCount}
            </p>
            <button
  onClick={() => requestAccess(room._id)}
  className="w-full bg-yellow-600 py-2 rounded-lg hover:bg-yellow-700"
>
  Request Access
</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rooms;