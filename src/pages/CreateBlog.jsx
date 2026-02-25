import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../config";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CreateBlog = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
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

    if (!token) {
      alert("You must be logged in to publish");
      return;
    }

    try {
      await axios.post(`${BASE_URL}/blogs`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/blogs");
    } catch (error) {
      console.log("ERROR:", error.response?.data || error.message);
      alert("Error publishing blog");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050b1e] via-[#0a1230] to-[#0b1b3f] text-white">

      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-16">

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center mb-10">
          Share Your Thought ✍️
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white/5 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/10 shadow-lg"
        >
          <input
            type="text"
            name="title"
            placeholder="Blog Title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-transparent border border-white/20 text-white text-lg sm:text-xl focus:outline-none focus:border-blue-500"
          />

          <textarea
            name="description"
            placeholder="Write your blog..."
            value={formData.description}
            onChange={handleChange}
            required
            rows="8"
            className="w-full p-4 rounded-lg bg-transparent border border-white/20 text-white focus:outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition duration-200 py-3 rounded-lg font-semibold"
          >
            Publish
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default CreateBlog;