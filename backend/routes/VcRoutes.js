const express = require("express");
const router = express.Router();

const VcRoom = require("../models/VcRoom");
const protect = require("../middleware/auth");

// 🔹 CREATE ROOM
router.post("/create", protect, async (req, res) => {
  try {
    const { name, isPrivate } = req.body;

    const room = await VcRoom.create({
      name,
      isPrivate: !!isPrivate,
      owner: req.user._id,
      admins: [],
    });

    // Populate owner before sending back
    const populated = await VcRoom.findById(room._id).populate(
      "owner",
      "name email"
    );

    res.status(201).json(populated);
  } catch (err) {
    console.error("CREATE VC ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🔹 DELETE ROOM
// Public VCs  → anyone logged-in can delete
// Private VCs → only the owner can delete
router.delete("/:id", protect, async (req, res) => {
  try {
    const vc = await VcRoom.findById(req.params.id);

    if (!vc) {
      return res.status(404).json({ message: "VC not found" });
    }

    const userId = req.user._id.toString();
    const isOwner = vc.owner && vc.owner.toString() === userId;

    // Private VC → only owner can delete
    if (vc.isPrivate && !isOwner) {
      return res
        .status(403)
        .json({ message: "Only the owner can delete a private channel" });
    }

    // Public VC → anyone can delete (no restriction)

    await vc.deleteOne();

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🔹 GET PUBLIC ROOMS (anyone can see these)
router.get("/public", async (req, res) => {
  try {
    const rooms = await VcRoom.find({ isPrivate: false })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json(rooms);
  } catch (err) {
    console.error("GET PUBLIC ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🔹 GET PRIVATE ROOMS (user's own)
router.get("/private", protect, async (req, res) => {
  try {
    const rooms = await VcRoom.find({
      isPrivate: true,
      owner: req.user._id,
    })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json(rooms);
  } catch (err) {
    console.error("GET PRIVATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;