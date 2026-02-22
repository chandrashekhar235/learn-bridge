const mongoose = require("mongoose");
const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,

        },
        description: {
            type: String,
        },
        type: {
            type: String,
            enum: ["public", "private"],
            default: "public",
        },
       createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    pendingRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("Group", groupSchema);