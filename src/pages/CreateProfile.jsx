import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:7777";

const CreateProfile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    name: "",
    interests: "",
    hobbies: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("interests", formData.interests);
      data.append("hobbies", formData.hobbies);
      if (avatar) data.append("avatar", avatar);

      await axios.post(`${API}/profile/create`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert("Profile creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-8 rounded-lg w-96"
      >
        <h2 className="text-white text-xl mb-4">Create Your Profile</h2>

        <input
          type="text"
          name="name"
          placeholder="Name"
          className="w-full mb-3 p-2 rounded"
          onChange={handleChange}
          required
        />

        <input
          type="file"
          accept="image/*"
          className="w-full mb-3 text-white"
          onChange={(e) => setAvatar(e.target.files[0])}
          required
        />

        <input
          type="text"
          name="interests"
          placeholder="Interests (comma separated)"
          className="w-full mb-3 p-2 rounded"
          onChange={handleChange}
        />

        <input
          type="text"
          name="hobbies"
          placeholder="Hobbies (comma separated)"
          className="w-full mb-3 p-2 rounded"
          onChange={handleChange}
        />

        <button
          disabled={loading}
          className="bg-blue-600 w-full py-2 rounded text-white"
        >
          {loading ? "Saving..." : "Create Profile"}
        </button>
      </form>
    </div>
  );
};

export default CreateProfile;
