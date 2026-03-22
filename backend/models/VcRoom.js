// models/VcRoom.js

const mongoose = require("mongoose");

const vcRoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isPrivate: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User",
    required: true,
   },
   admins: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }
],
  participants: [{ type: String }], // store socketIds
}, { timestamps: true });

module.exports = mongoose.model("VcRoom", vcRoomSchema);  