import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../config";   // ✅ import production URL

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);
        setFormData(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");

      const updatePayload = {
        name: formData.name,
        interests: formData.interests,
        hobbies: formData.hobbies,
      };

      const response = await axios.put(
        `${BASE_URL}/profile`,
        updatePayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      setError("Failed to update profile");
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!user || !formData) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="pb-10 w-full max-w-md">
        <h1 className="text-3xl sm:text-5xl font-bold pb-10 text-center text-white">
          Account Details
        </h1>

        <div className="text-white">
          <Link to="/" className="px-4 py-2 bg-blue-500 text-white rounded">
            Go Home
          </Link>
        </div>

        {user.avatar && (
          <div className="flex justify-center">
            <img
              src={`${BASE_URL}${user.avatar}`}   // ✅ fixed here also
              alt="profile"
              className="w-40 h-40 sm:w-60 sm:h-60 rounded-full object-cover"
            />
          </div>
        )}

        <div className="pt-10 space-y-6">
          {isEditing ? (
            <>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full p-2 rounded bg-gray-800 text-white"
              />

              <input
                type="text"
                value={formData.interests?.join(", ") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    interests: e.target.value
                      .split(",")
                      .map((i) => i.trim()),
                  })
                }
                className="w-full p-2 rounded bg-gray-800 text-white"
              />

              <input
                type="text"
                value={formData.hobbies?.join(", ") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hobbies: e.target.value
                      .split(",")
                      .map((h) => h.trim()),
                  })
                }
                className="w-full p-2 rounded bg-gray-800 text-white"
              />

              <div className="flex gap-4">
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Save
                </button>

                <button
                  onClick={() => {
                    setFormData(user);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-purple-200 font-bold text-2xl">{user.name}</p>
              <p className="text-purple-200 text-xl">
                {user.interests?.join(", ") || "—"}
              </p>
              <p className="text-white">
                {user.hobbies?.join(", ") || "—"}
              </p>

              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded"
              >
                Edit Profile
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;