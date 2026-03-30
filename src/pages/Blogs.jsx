import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import BlogCard from "../components/BlogCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BASE_URL from "../config";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/blogs`);
      setBlogs(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen ">

      <Navbar />

     
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white">
          Blogs
        </h1>

        <p className="mt-6 text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
          Insights, guides, and resources to help you grow in tech.
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-center text-gray-400 mt-10">
          Loading blogs...
        </p>
      )}

      {/* ERROR */}
      {error && (
        <p className="text-center text-red-400 mt-10">
          {error}
        </p>
      )}

     
      {!loading && !error && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 grid gap-8">
          {blogs.length === 0 ? (
            <p className="text-gray-400 text-center">
              Write What You Feel 
            </p>
          ) : (
            blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))
          )}
        </div>
      )}

      <div className="text-center pb-12">
        <Link
          to="/create-blog"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200"
        >
          Write a Blog .... 
        </Link>
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Blogs;