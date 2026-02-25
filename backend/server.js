require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const userRoutes = require("./routes/UserRoutes");
const blogRoutes = require("./routes/BlogRoutes");
const groupRoutes = require("./routes/GroupRoutes");

const app = express();

/* ======================
   CORS CONFIG
====================== */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://learn-bridge-woad.vercel.app"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Main server working");
});

/* ======================
   ROUTES
====================== */
app.use("/", userRoutes);
app.use("/", blogRoutes);
app.use("/", groupRoutes);

/* ======================
   DATABASE
====================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected"))
  .catch((err) => {
    console.error("DB error", err);
    process.exit(1);
  });

/* ======================
   SOCKET.IO SETUP
====================== */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://learn-bridge-woad.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", socket.id);
  });

  socket.on("signal", ({ to, signal }) => {
    io.to(to).emit("signal", {
      from: socket.id,
      signal,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/* ======================
   PORT
====================== */
const PORT = process.env.PORT || 7777;

server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});