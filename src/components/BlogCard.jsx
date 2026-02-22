import React from "react";
import axios from "axios";

const API = "http://localhost:7777";

const BlogCard = ({ blog }) => {

  const handleDelete = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in");
      return;
    }

    try {
      await axios.delete(`${API}/blogs/${blog._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      window.location.reload(); // simple refresh
    } catch (error) {
      console.log(error);
      alert("Error deleting blog");
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl">
      <h2 className="text-xl font-bold text-white mb-3">
        {blog.title}
      </h2>

      <p className="text-gray-400 mb-4">
        {blog.description}
      </p>

      <p className="text-sm text-gray-500 mb-4">
        By {blog.author}
      </p>

      <button
        onClick={handleDelete}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
      >
        Delete
      </button>
    </div>
  );
};

export default BlogCard;
