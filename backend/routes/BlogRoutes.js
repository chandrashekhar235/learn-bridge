const express = require("express");
const Blog = require("../models/Blog");
const User = require("../models/User");
const protect = require("../middleware/auth");


const router = express.Router();

router.post("/blogs", protect, async (req, res) => {
  try {
    console.log("REQ USER:", req.user);  // 🔍 Debug line

    const { title, description } = req.body;

    const user = await User.findById(req.user.id || req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newBlog = new Blog({
      title,
      description,
      author: user.name,
    });

    await newBlog.save();

    res.status(201).json(newBlog);
  } catch (error) {
    console.log("BLOG ERROR:", error);  // 🔍 Debug line
    res.status(500).json({ message: error.message });
  }
});



router.get("/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.put("/blogs/:id", protect, async (req, res) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/blogs/:id", protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    await blog.deleteOne();

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;


