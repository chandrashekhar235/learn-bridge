import React from "react";
import axios from "axios";
import BASE_URL from "../config";

const BlogCard = ({ blog }) => {

  const userId = localStorage.getItem("userId");

  const handleDelete = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in");
      return;
    }

    try {
      await axios.delete(`${BASE_URL}/blogs/${blog._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      window.location.reload();
    } catch (error) {
      console.log(error);
      alert("Error deleting blog");
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 
                    p-4 sm:p-6 
                    rounded-2xl 
                    w-full 
                    max-w-md 
                    mx-auto 
                    shadow-lg">

      <h2 className="text-lg sm:text-xl font-bold text-white mb-3">
        {blog.title}
      </h2>

      <p className="text-gray-400 text-sm sm:text-base mb-4">
        {blog.description}
      </p>

      <p className="text-xs sm:text-sm text-gray-500 mb-4">
        By {blog.author}
      </p>

      {blog.user === userId && (
        <button
          onClick={handleDelete}
          className="w-full sm:w-auto 
                     bg-red-600 hover:bg-red-700 
                     text-white 
                     px-4 py-2 
                     rounded-lg 
                     transition duration-200">
          Delete
        </button>
      )}

    </div>
  );
};

export default BlogCard;