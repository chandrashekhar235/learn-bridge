require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); 


const userRoutes = require("./routes/UserRoutes");
const blogRoutes = require("./routes/BlogRoutes");
const groupRoutes = require("./routes/GroupRoutes");
const app = express();

// middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));



app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/", (req, res) => {
  res.send("Main server working");
});


// routes
app.use("/", userRoutes);
app.use("/", blogRoutes);
app.use("/", groupRoutes);

// db 
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("db working"))
  .catch((err) => {
    console.error("db error", err);
    process.exit(1);
  });

//port
const PORT = 7777;

console.log("backend connected to port - 7777");

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
