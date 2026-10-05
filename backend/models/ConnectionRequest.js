const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Indexes for efficient querying
 */
connectionRequestSchema.index({ fromUser: 1, toUser: 1 });
connectionRequestSchema.index({ toUser: 1, status: 1 });
connectionRequestSchema.index({ fromUser: 1, status: 1 });

/*
 * Prevent duplicate requests (A->B and B->A are different, but we want to prevent
 * multiple A->B requests)
 */
connectionRequestSchema.index(
  { fromUser: 1, toUser: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);