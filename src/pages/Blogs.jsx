import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import BlogCard from "../components/BlogCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API = "http://localhost:7777";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get(`${API}/blogs`);
      setBlogs(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient from-[#050b1e] via-[#0a1230] to-[#0b1b3f]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-5 text-center">
        <h1 className="text-3xl md:text:4xl font-semibold text-white">
           Blogs
        </h1>
        <p className="mt-10 text-gray-400 max-w-2xl mx-auto">
          Insights, guides, and resources to help you grow in tech.
        </p>
      

      </div>


      {loading && (
        <p className="text-center text-gray-400 mt-10">
          Loading blogs...
        </p>
      )}

      {error && (
        <p className="text-center text-red-400 mt-10">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="max-w-4xl mx-auto px-6 py-16 space-y-8">
          {blogs.length === 0 ? (
            <p className="text-gray-400 text-center col-span-full">
              No blogs yet. Be the first to publish 🚀
            </p>
          ) : (
            blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))
          )}
        </div>
      )}
      <div className="mt-6  text-center">
       <Link
    to="/create-blog"
    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
  >
    Write a Blog ✍️
  </Link>
  </div>

      <Footer />
    </div>
  );
};

export default Blogs;
