import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:7777";

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
    console.log("TOKEN:", token);

    if (!token) {
      alert("You must be logged in to publish");
      return;
    }

    try {
      await axios.post(
        `${API}/blogs`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/blogs");
    } catch (error) {
      console.log("ERROR:", error.response?.data || error.message);
    }
  };

  return (
   <div className="min-h-screen flex flex-col items-center pt-10">
  <h1 className=" mt-10 mb-6 text-white text-3xl font-semibold text-center">
    Share your Thought
  </h1>
    
    <div className="w-full max-w-4xl space-y-4 mt-10">
      <form onSubmit={handleSubmit} className=" text-black">
        <input
          type="text"
          name="title"
          placeholder="Blog Title"
          value={formData.title}
          onChange={handleChange}
          required
          className="text-white border p-2 mb-10 font-semibold text-2xl w-full"
        />

        <textarea
          name="description"
          placeholder="Write your blog..."
          value={formData.description}
          onChange={handleChange}
          required
          rows="4"
          className="w-full h-72 p-4 rounded text-white "
        />

        <button
          type="submit"
          className="text-white  mt-10 mb-10 w-full"
        >
          Publish
        </button>
      </form>
    </div>
    </div>
  );
};

export default CreateBlog;
