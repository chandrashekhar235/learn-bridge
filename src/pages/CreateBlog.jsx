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

  const [loadingAI, setLoadingAI] = useState(false);

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // PUBLISH BLOG
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

      alert("Blog published successfully!");

      navigate("/blogs");

    } catch (error) {
      console.log("ERROR:", error.response?.data || error.message);

      alert("Error publishing blog");
    }
  };

  // AI GENERATE BLOG
  const generateWithAI = async () => {
    if (!formData.title.trim()) {
      alert("Enter blog title first");
      return;
    }

    try {
      setLoadingAI(true);

      const res = await axios.post(
        `${BASE_URL}/ai/generate-blog`,
        {
          topic: formData.title,
        }
      );

      setFormData((prev) => ({
        ...prev,
        description: res.data.content,
      }));

    } catch (err) {
      console.log(err);

      alert("AI generation failed");
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="min-h-screen text-white flex flex-col">

      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 flex-1">

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center mb-10">
          Share Your Thought ✍️
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white/5 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/10 shadow-lg"
        >

          {/* TITLE */}
          <input
            type="text"
            name="title"
            placeholder="Blog Title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-transparent border border-white/20 text-white text-lg sm:text-xl focus:outline-none focus:border-blue-500"
          />

          {/* DESCRIPTION */}
          <textarea
            name="description"
            placeholder="Write your blog..."
            value={formData.description}
            onChange={handleChange}
            required
            rows="10"
            className="w-full p-4 rounded-lg bg-transparent border border-white/20 text-white focus:outline-none focus:border-blue-500"
          />

          {/* AI BUTTON */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={generateWithAI}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white text-sm transition-all"
            >
              {loadingAI
                ? "Generating..."
                : "✨ Generate With AI"}
            </button>
          </div>

          {/* HELPER TEXT */}
          <p className="text-xs text-gray-400 text-right">
            AI generates a draft based on your title. You can edit it before publishing.
          </p>

          {/* SUBMIT */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition duration-200 py-3 rounded-lg font-semibold"
          >
            Publish
          </button>

        </form>
      </div>

      <div className="pt-8">
        <Footer />
      </div>
    </div>
  );
};

export default CreateBlog;