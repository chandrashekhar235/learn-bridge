import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:7777";

const GroupAdmin = () => {
  const { id } = useParams();
  const [group, setGroup] = useState(null);

  useEffect(() => {
    fetchGroup();
  }, []);

  const fetchGroup = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API}/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setGroup(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const approveUser = async (userId) => {
    const token = localStorage.getItem("token");

    await axios.post(
      `${API}/groups/${id}/approve/${userId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchGroup(); // refresh
  };

  if (!group) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">

      <h1 className="text-2xl sm:text-3xl font-bold mb-6">
        Admin Panel: {group.name}
      </h1>

      {/* Pending Requests */}
      <div className="mb-10">
        <h2 className="text-xl text-yellow-400 mb-4">
          Pending Requests
        </h2>

        {group.pendingRequests.length === 0 ? (
          <p className="text-gray-400">No pending requests</p>
        ) : (
          group.pendingRequests.map(user => (
            <div
              key={user._id}
              className="bg-gray-800 p-4 rounded-lg mb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
            >
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>

              <button
                onClick={() => approveUser(user._id)}
                className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Approve
              </button>
            </div>
          ))
        )}
      </div>

      {/* Members */}
      <div>
        <h2 className="text-xl text-green-400 mb-4">
          Members ({group.members.length})
        </h2>

        {group.members.map(user => (
          <div
            key={user._id}
            className="bg-gray-800 p-4 rounded-lg mb-3"
          >
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default GroupAdmin;