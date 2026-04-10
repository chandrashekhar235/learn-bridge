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
      admins: [req.user._id],
      members: [req.user._id],
    });

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
router.delete("/:id", protect, async (req, res) => {
  try {
    const vc = await VcRoom.findById(req.params.id);

    if (!vc) {
      return res.status(404).json({ message: "VC not found" });
    }

    const userId = req.user._id.toString();
    const isOwner = vc.owner && vc.owner.toString() === userId;

    if (vc.isPrivate && !isOwner) {
      return res
        .status(403)
        .json({ message: "Only the owner can delete a private channel" });
    }

    await vc.deleteOne();

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🔹 GET PUBLIC ROOMS
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

// 🔹 GET PRIVATE ROOMS (Show all for other users to join/request)
router.get("/private", async (req, res) => {
  try {
    const rooms = await VcRoom.find({ isPrivate: true })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json(rooms);
  } catch (err) {
    console.error("GET PRIVATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🔹 REQUEST ACCESS TO PRIVATE VC
router.post("/:id/request", protect, async (req, res) => {
  try {
    const vc = await VcRoom.findById(req.params.id);

    if (!vc) return res.status(404).json({ message: "VC not found" });

    if (vc.members.includes(req.user._id)) {
      return res.status(400).json({ message: "Already a member" });
    }

    if (vc.pendingRequests.includes(req.user._id)) {
      return res.status(400).json({ message: "Request already sent" });
    }

    vc.pendingRequests.push(req.user._id);
    await vc.save();

    res.json({ message: "Request sent successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 APPROVE REQUEST
router.post("/:id/approve/:userId", protect, async (req, res) => {
  try {
    const vc = await VcRoom.findById(req.params.id);

    if (!vc) return res.status(404).json({ message: "VC not found" });

    // Only owner/admin can approve
    const isAuthorized = vc.owner.toString() === req.user._id.toString() || 
                        vc.admins.includes(req.user._id);

    if (!isAuthorized) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const targetUserId = req.params.userId;

    // Move from pending to members
    vc.pendingRequests = vc.pendingRequests.filter(id => id.toString() !== targetUserId);
    if (!vc.members.includes(targetUserId)) {
      vc.members.push(targetUserId);
    }

    await vc.save();
    res.json({ message: "Request approved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;