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

  // Decode current user ID from JWT
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

  // FETCH ROOMS
  const fetchRooms = async () => {
    try {
      setFetching(true);

      const [pubRes, privRes] = await Promise.all([
        axios.get(`${BASE_URL}/vc/public`),

        token
          ? axios.get(`${BASE_URL}/vc/private`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
          : axios.get(`${BASE_URL}/vc/private`),
      ]);

      console.log("PUBLIC ROOMS:", pubRes.data);
      console.log("PRIVATE ROOMS:", privRes.data);

      setPublicRooms(pubRes.data || []);
      setPrivateRooms(privRes.data || []);
    } catch (err) {
      console.error("FETCH ERROR:", err.response?.data || err.message);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // CREATE ROOM
  const createRoom = async () => {
    if (!roomName.trim()) {
      alert("Enter a room name");
      return;
    }

    if (!token) {
      alert("Please login first");
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
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("ROOM CREATED:", res.data);

      setRoomName("");

      await fetchRooms();

      // Navigate after refresh
      navigate(`/vc/${res.data._id}`);
    } catch (err) {
      console.error("CREATE ERROR:", err.response?.data || err.message);

      alert(
        err.response?.data?.message || "Error creating room"
      );
    } finally {
      setLoading(false);
    }
  };

  // REQUEST ACCESS
  const requestAccess = async (id) => {
    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/vc/${id}/request`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Access request sent!");

      fetchRooms();
    } catch (err) {
      console.error("REQUEST ERROR:", err.response?.data || err.message);

      alert(
        err.response?.data?.message ||
          "Error sending request"
      );
    }
  };

  // DELETE ROOM
  const deleteRoom = async (
    id,
    roomIsPrivate,
    roomOwnerId
  ) => {
    if (roomIsPrivate) {
      const ownerId =
        typeof roomOwnerId === "object"
          ? roomOwnerId._id
          : roomOwnerId;

      if (
        ownerId?.toString() !==
        currentUserId?.toString()
      ) {
        alert(
          "Only the owner can delete private channels"
        );
        return;
      }
    }

    const confirmDelete = window.confirm(
      "Delete this channel?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${BASE_URL}/vc/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchRooms();
    } catch (err) {
      console.error("DELETE ERROR:", err.response?.data || err.message);

      alert(
        err.response?.data?.message ||
          "Error deleting room"
      );
    }
  };

  // GET OWNER NAME
  const getOwnerName = (room) => {
    if (room.owner && typeof room.owner === "object") {
      return (
        room.owner.name ||
        room.owner.email ||
        "Unknown"
      );
    }

    return "Unknown";
  };

  // CAN DELETE CHECK
  const canDelete = (room) => {
    if (!token) return false;

    // Public → anyone logged in
    if (!room.isPrivate) return true;

    // Private → only owner
    const ownerId =
      typeof room.owner === "object"
        ? room.owner._id
        : room.owner;

    return (
      ownerId?.toString() ===
      currentUserId?.toString()
    );
  };

  // ROOM CARD
  const RoomCard = ({ room, color }) => {
    const borderColor =
      color === "green"
        ? "border-green-500/30"
        : "border-amber-500/30";

    const hoverBg =
      color === "green"
        ? "hover:bg-green-900/20"
        : "hover:bg-amber-900/20";

    const badge =
      color === "green"
        ? "bg-green-500/20 text-green-400"
        : "bg-amber-500/20 text-amber-400";

    // OWNER CHECK
    const ownerId =
      typeof room.owner === "object"
        ? room.owner._id
        : room.owner;

    const isOwner =
      ownerId?.toString() ===
      currentUserId?.toString();

    // MEMBER CHECK
    const isMember = room.members?.some(
      (id) =>
        id.toString() ===
        currentUserId?.toString()
    );

    // PENDING CHECK
    const isPending = room.pendingRequests?.some(
      (id) =>
        id.toString() ===
        currentUserId?.toString()
    );

    const showDelete = canDelete(room);

    return (
      <div
        className={`bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border ${borderColor} ${hoverBg} transition-all duration-300 flex justify-between items-center cursor-pointer group`}
        onClick={() => {
          // PUBLIC ROOM
          if (!room.isPrivate) {
            navigate(`/vc/${room._id}`);
            return;
          }

          // PRIVATE ROOM
          if (isMember || isOwner) {
            navigate(`/vc/${room._id}`);
          } else if (isPending) {
            alert("Request pending approval");
          } else {
            requestAccess(room._id);
          }
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-lg ${badge} flex items-center justify-center text-lg shrink-0`}
          >
            {color === "green" ? "🌐" : "🔒"}
          </div>

          <div className="min-w-0">
            <p className="font-medium text-white truncate">
              {room.name}
            </p>

            <p className="text-xs text-gray-500">
              by {getOwnerName(room)} •{" "}
              {new Date(
                room.createdAt
              ).toLocaleDateString()}
            </p>

            {room.isPrivate &&
              !isMember &&
              !isOwner && (
                <p className="text-[10px] text-amber-500 mt-0.5">
                  {isPending
                    ? "⏳ Pending Approval"
                    : "🔒 Request to Join"}
                </p>
              )}
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
            className="text-gray-500 hover:text-red-400 transition-colors text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100"
          >
            🗑️
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen from-gray-900 via-[#0a0f1e] to-black text-white flex flex-col">
      <Navbar />

      <div className="flex-1 p-4 sm:p-6">
        <h1 className="text-3xl font-bold text-center mb-2">
          Voice Channels
        </h1>

        <p className="text-gray-500 text-center mb-10 text-sm">
          Create or join a voice/video channel
        </p>

        <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* PUBLIC */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Public Channels
              </h2>

              <span className="text-xs text-gray-500">
                {publicRooms.length} channels
              </span>
            </div>

            <div className="space-y-3">
              {fetching ? (
                <p className="text-gray-500 text-sm">
                  Loading...
                </p>
              ) : publicRooms.length === 0 ? (
                <div className="bg-gray-800/40 border border-dashed border-gray-700 rounded-xl p-6 text-center">
                  <p className="text-gray-500 text-sm">
                    No public channels yet
                  </p>
                </div>
              ) : (
                publicRooms.map((room) => (
                  <RoomCard
                    key={room._id}
                    room={room}
                    color="green"
                  />
                ))
              )}
            </div>
          </div>

          {/* PRIVATE */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Private Channels
              </h2>

              <span className="text-xs text-gray-500">
                {privateRooms.length} channels
              </span>
            </div>

            <div className="space-y-3">
              {fetching ? (
                <p className="text-gray-500 text-sm">
                  Loading...
                </p>
              ) : privateRooms.length === 0 ? (
                <div className="bg-gray-800/40 border border-dashed border-gray-700 rounded-xl p-6 text-center">
                  <p className="text-gray-500 text-sm">
                    No private channels yet
                  </p>
                </div>
              ) : (
                privateRooms.map((room) => (
                  <RoomCard
                    key={room._id}
                    room={room}
                    color="amber"
                  />
                ))
              )}
            </div>
          </div>

          {/* CREATE */}
          <div>
            <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-2xl border border-white/5 shadow-xl">
              <h2 className="text-xl font-semibold mb-5">
                Create Channel
              </h2>

              <input
                type="text"
                placeholder="Channel name..."
                value={roomName}
                onChange={(e) =>
                  setRoomName(e.target.value)
                }
                onKeyDown={(e) =>
                  e.key === "Enter" && createRoom()
                }
                className="w-full px-4 py-3 rounded-lg bg-gray-900/80 border border-white/10 text-white placeholder-gray-500 mb-4 focus:outline-none focus:border-blue-500"
              />

              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setIsPrivate(false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                    !isPrivate
                      ? "bg-green-600 text-white"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  🌐 Public
                </button>

                <button
                  onClick={() => setIsPrivate(true)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                    isPrivate
                      ? "bg-amber-600 text-white"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  🔒 Private
                </button>
              </div>

              <button
                onClick={createRoom}
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 transition-all"
              >
                {loading
                  ? "Creating..."
                  : "Create Channel"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VcLanding;