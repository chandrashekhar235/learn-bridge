import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BASE_URL from "../config";

const CreateGroup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "public",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      await axios.post(`${BASE_URL}/groups`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Group created!");
      navigate("/rooms");
    } catch (error) {
      console.log(error);
      alert("Error creating group");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 sm:px-6 pt-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
          Create a Study Group
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 bg-white/5 backdrop-blur-md p-5 sm:p-8 rounded-2xl border border-white/10 shadow-lg"
        >
          <input
            type="text"
            name="name"
            placeholder="Group Name"
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-transparent border border-white/20 text-white focus:outline-none focus:border-blue-500"
          />

          <textarea
            name="description"
            placeholder="Description"
            onChange={handleChange}
            rows="4"
            className="w-full p-3 rounded-lg bg-transparent border border-white/20 text-white focus:outline-none focus:border-blue-500"
          />

          <select
            name="type"
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-800 border border-white/20 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition duration-200 py-3 rounded-lg font-semibold"
          >
            Create Group
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;