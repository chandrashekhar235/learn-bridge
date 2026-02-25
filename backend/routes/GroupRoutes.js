const express = require("express");
const Group = require("../models/Group");
const protect = require("../middleware/auth");

const router = express.Router();
console.log("GROUP ROUTES FILE LOADED");


// create vc 
router.post("/groups", protect, async (req, res) => {
  try {
    const { name, description, type } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const newGroup = new Group({
      name,
      description,
      type,
      createdBy: req.user.id,
      members: [req.user.id],
    });

    await newGroup.save();

    res.status(201).json({
      message: "Group created successfully",
      group: newGroup,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ GET ALL GROUPS (Formatted for Landing Page)
router.get("/groups", async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("createdBy", "name");

    const formattedGroups = groups.map(group => ({
      _id: group._id,
      name: group.name,
      description: group.description,
      type: group.type,
      createdBy: group.createdBy?.name || "Unknown",
      membersCount: group.members.length,
      createdAt: group.createdAt
    }));

    res.status(200).json(formattedGroups);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
/// accessing pvt vc by sending req
router.post("/groups/:id/request", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // If already member
    if (group.members.includes(req.user.id)) {
      return res.status(400).json({ message: "Already a member" });
    }

    // If already requested
    if (group.pendingRequests.includes(req.user.id)) {
      return res.status(400).json({ message: "Request already sent" });
    }

    group.pendingRequests.push(req.user.id);
    await group.save();

    res.status(200).json({ message: "Request sent successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// ✅ Approve join request
router.post("/groups/:id/approve/:userId", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Only creator can approve
    if (group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const userId = req.params.userId;

    // Remove from pending
    group.pendingRequests = group.pendingRequests.filter(
      id => id.toString() !== userId
    );

    // Add to members
    if (!group.members.includes(userId)) {
      group.members.push(userId);
    }

    await group.save();

    res.status(200).json({ message: "User approved successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// 🚪 Join group (public OR approved private)
router.post("/groups/:id/join", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.type === "private" && 
        !group.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!group.members.includes(req.user.id)) {
      group.members.push(req.user.id);
      await group.save();
    }

    res.status(200).json({ message: "Joined successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// 🔍 Get single group details (for admin panel)
router.get("/groups/:id", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("pendingRequests", "name email")
      .populate("members", "name email")
      .populate("createdBy", "name");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Only creator can view full details
    if (group.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json(group);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;