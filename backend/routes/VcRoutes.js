const express = require("express");
const router = express.Router();
const VcRoom = require("../models/VcRoom");

// CREATE ROOM
router.post("/create", async (req, res) => {
  try {
    const { name, isPrivate } = req.body;

    const room = await VcRoom.create({
      name,
      isPrivate,
    });

    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET PUBLIC ROOMS
router.get("/public", async (req, res) => {
  try {
    const rooms = await VcRoom.find({ isPrivate: false });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;