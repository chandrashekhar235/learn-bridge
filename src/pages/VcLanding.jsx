import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../config";
import Navbar from "../components/Navbar";

const VcLanding = () => {
  const navigate = useNavigate();

  const [publicRooms, setPublicRooms] = useState([]);
  const [privateRooms, setPrivateRooms] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const token = localStorage.getItem("token");

  // Decode the logged-in user's ID from the JWT
  const getCurrentUserId = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id || payload._id || null;
    } catch {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();

  // Fetch all rooms (public + user's private)
  const fetchRooms = async () => {
    try {
      setFetching(true);

      const [pubRes, privRes] = await Promise.all([
        axios.get(`${BASE_URL}/vc/public`),
        token
          ? axios.get(`${BASE_URL}/vc/private`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve({ data: [] }),
      ]);

      setPublicRooms(pubRes.data);
      setPrivateRooms(privRes.data);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
    } finally {
      setFetching(false);
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

    if (!token) {
      alert("You must be logged in to create a room");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${BASE_URL}/vc/create`,
        { name: roomName, isPrivate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Clear form and refresh list instead of navigating away
      setRoomName("");
      await fetchRooms();

      // Then navigate to the room
      navigate(`/vc/${res.data._id}`);
    } catch (err) {
      console.error("Create error:", err.response?.data || err.message);
      alert("Error creating room");
    } finally {
      setLoading(false);
    }
  };

  // Delete room
  const deleteRoom = async (id, roomIsPrivate, roomOwnerId) => {
    // Private rooms → only owner can delete
    if (roomIsPrivate) {
      const ownerId =
        typeof roomOwnerId === "object" ? roomOwnerId._id : roomOwnerId;
      if (ownerId?.toString() !== currentUserId?.toString()) {
        alert("Only the owner can delete a private channel");
        return;
      }
    }

    if (!confirm("Delete this channel?")) return;

    try {
      await axios.delete(`${BASE_URL}/vc/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRooms();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Not allowed or error");
    }
  };

  // Get owner display name
  const getOwnerName = (room) => {
    if (room.owner && typeof room.owner === "object") {
      return room.owner.name || room.owner.email || "Unknown";
    }
    return "Unknown";
  };

  // Check if user can delete
  const canDelete = (room) => {
    if (!token) return false;
    // Public rooms → anyone logged-in can delete
    if (!room.isPrivate) return true;
    // Private rooms → only owner
    const ownerId =
      typeof room.owner === "object" ? room.owner._id : room.owner;
    return ownerId?.toString() === currentUserId?.toString();
  };

  // Room card component
  const RoomCard = ({ room, color }) => {
    const borderColor =
      color === "green" ? "border-green-500/30" : "border-amber-500/30";
    const hoverBg =
      color === "green" ? "hover:bg-green-900/20" : "hover:bg-amber-900/20";
    const badge =
      color === "green"
        ? "bg-green-500/20 text-green-400"
        : "bg-amber-500/20 text-amber-400";

    const showDelete = canDelete(room);

    return (
      <div
        className={`bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border ${borderColor} ${hoverBg} transition-all duration-300 flex justify-between items-center cursor-pointer group`}
        onClick={() => navigate(`/vc/${room._id}`)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-lg ${badge} flex items-center justify-center text-lg shrink-0`}
          >
            {color === "green" ? "🌐" : "🔒"}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-white truncate group-hover:text-blue-300 transition-colors">
              {room.name}
            </p>
            <p className="text-xs text-gray-500">
              by {getOwnerName(room)} •{" "}
              {new Date(room.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {showDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteRoom(
                room._id,
                room.isPrivate,
                room.owner
              );
            }}
            className="text-gray-600 hover:text-red-400 transition-colors text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100"
            title={
              room.isPrivate
                ? "Delete (owner only)"
                : "Delete"
            }
          >
            🗑️
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen  from-gray-900 via-[#0a0f1e] to-black text-white flex flex-col">
      <Navbar />

      <div className="flex-1 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">
          Voice Channels
        </h1>
        <p className="text-gray-500 text-center mb-8 sm:mb-10 text-sm">
          Create or join a voice/video channel to study together
        </p>

        <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* PUBLIC CHANNELS */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 " />
              <h2 className="text-lg font-semibold ">
                Public Channels
              </h2>
              <span className="text-xs text-gray-500 ml-auto">
                {publicRooms.length} channel{publicRooms.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-3">
              {fetching ? (
                <p className="text-gray-500 text-sm">Loading...</p>
              ) : publicRooms.length === 0 ? (
                <div className="bg-gray-800/40 border border-dashed border-gray-700 rounded-xl p-6 text-center">
                  <p className="text-gray-500 text-sm">
                    No public channels yet
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    Create one to get started →
                  </p>
                </div>
              ) : (
                publicRooms.map((room) => (
                  <RoomCard key={room._id} room={room} color="green" />
                ))
              )}
            </div>
          </div>

          {/* PRIVATE CHANNELS */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3" />
              <h2 className="text-xl font-semibold">
                Private Channels
              </h2>
              <span className="text-xs text-gray-500 ml-auto">
                {privateRooms.length} channel{privateRooms.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-3">
              {fetching ? (
                <p className="text-gray-500 text-sm">Loading...</p>
              ) : privateRooms.length === 0 ? (
                <div className="bg-gray-800/40 border border-dashed border-gray-700 rounded-xl p-6 text-center">
                  <p className="text-gray-500 text-sm">
                    No private channels yet
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    Only you & invited members can see these
                  </p>
                </div>
              ) : (
                privateRooms.map((room) => (
                  <RoomCard key={room._id} room={room} color="amber" />
                ))
              )}
            </div>
          </div>

          {/* CREATE CHANNEL */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-2xl border border-white/5 shadow-xl">
              <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
                <span className="text-2xl">Create Channel</span>
              </h2>

              <input
                type="text"
                placeholder="Channel name..."
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createRoom()}
                className="w-full px-4 py-3 rounded-lg bg-gray-900/80 border border-white/10 text-white placeholder-gray-500 mb-4 focus:outline-none focus:border-blue-500 transition-colors"
              />

              {/* Toggle for Public / Private */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setIsPrivate(false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    !isPrivate
                      ? "bg-green-600 text-white shadow-lg shadow-green-600/20"
                      : "bg-gray-700/50 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  🌐 Public
                </button>
                <button
                  onClick={() => setIsPrivate(true)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    isPrivate
                      ? "text-white shadow-lg shadow-amber-600/20"
                      : " text-gray-400 hover:bg-gray-700"
                  }`}
                >
                   Private
                </button>
              </div>

              <button
                onClick={createRoom}
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-600/20"
              >
                {loading ? "Creating..." : "Create Channel"}
              </button>

              <p className="text-xs text-gray-600 mt-3 text-center">
                {isPrivate
                  ? "🔒 Only you can see & delete this channel"
                  : "🌐 Anyone can see & delete this channel"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VcLanding;