const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { OAuth2Client } = require("google-auth-library");


const protect = require("../middleware/auth");
const User = require("../models/User");


// google client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
)
// upload to db
const upload = multer({
  dest: "uploads/",
});

// signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Fill all fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// google signup
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    if (!email) {
      return res.status(400).json({
        message: "Google account email not available",
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // Existing normal account → link Google account
      if (!user.googleId) {
        user.googleId = googleId;
      }

      // Use Google profile picture if user doesn't already have one
      if (!user.avatar && picture) {
        user.avatar = picture;
      }

      await user.save();
    } else {
      // Create new Google user
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        googleId,
        avatar: picture || "",
        password: "",
      });
    }

    // Create YOUR LearnBridge JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("GOOGLE LOGIN ERROR:", error);

    res.status(401).json({
      message: "Google authentication failed",
    });
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Fill all fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// profile
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// changes in profile
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, interests, hobbies } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (interests !== undefined) user.interests = interests;
    if (hobbies !== undefined) user.hobbies = hobbies;

    const updatedUser = await user.save();

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      interests: updatedUser.interests,
      hobbies: updatedUser.hobbies,
      avatar: updatedUser.avatar,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// profile creation 
router.post(
  "/profile/create",
  protect,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const { name, interests, hobbies } = req.body;

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (name !== undefined) user.name = name;
      if (interests) user.interests = interests.split(",");
      if (hobbies) user.hobbies = hobbies.split(",");
      if (req.file) user.avatar = `/uploads/${req.file.filename}`;

      await user.save();

      res.json({ message: "Profile created successfully" });

    } catch (err) {
      console.error("Create profile error:", err);
      res.status(500).json({ message: "Profile creation failed" });
    }
  }
);

module.exports = router;
