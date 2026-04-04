const express = require("express");
const router = express.Router();

const VcRoom = require("../models/VcRoom");
const protect = require("../middleware/auth"); // ✅ IMPORT THIS

// 🔹 CREATE ROOM
router.post("/create", protect, async (req, res) => {
  try {
    const { name, isPrivate } = req.body;

    const room = await VcRoom.create({
      name,
      isPrivate,
      owner: req.user._id,
      admins: [],
    });

    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 🔹 DELETE ROOM
router.delete("/:id", protect, async (req, res) => {
  try {
    const vc = await VcRoom.findById(req.params.id);

    if (!vc) {
      return res.status(404).json({ message: "VC not found" });
    }

    const userId = req.user._id;

    const isOwner =
      vc.owner && vc.owner.toString() === userId.toString();

    const isAdmin = vc.admins?.some(
      (admin) => admin.toString() === userId.toString()
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await vc.deleteOne();

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    console.error("DELETE ERROR:", err); // 🔥 ADD THIS
    res.status(500).json({ message: err.message });
  }
});

// 🔹 GET PUBLIC ROOMS
router.get("/public", async (req, res) => {
  try {
    const rooms = await VcRoom.find({ isPrivate: false }).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 GET PRIVATE ROOMS (user's own)
router.get("/private", protect, async (req, res) => {
  try {
    const rooms = await VcRoom.find({
      isPrivate: true,
      owner: req.user._id,
    }).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;