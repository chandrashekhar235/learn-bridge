const mongoose = require("mongoose"); // called moongoose tool

const BlogSchema = new mongoose.Schema( // defined a structure tht how the data should be saved
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: [String],
      default: [],
    },
    references: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Blog", BlogSchema); // created a object blog tht will use all this 

