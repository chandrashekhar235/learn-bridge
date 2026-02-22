    const express = require("express");
    const Group = require("../models/Group");
    const protect = require("../middleware/auth");

    const router = express.Router();
    console.log("GROUP ROUTES FILE LOADED");
   

    router.post("/groups", protect, async (req, res) => {
    try {
        const { name, description, type } = req.body;

        const newGroup = new Group({
        name,
        description,
        type,
        createdBy: req.user.id,
        members: [req.user.id],
        });

        await newGroup.save();

        res.status(201).json(newGroup);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    });
    router.get("/groups", async (req, res) => {
    try {
        const groups = await Group.find();
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    });
    module.exports = router;