const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: false,
    default: "",
  },
  googleId: {
    type: String,
    required: true,
    sparse: true,
  },

  avatar: {
    type: String,
    default: "",
  },

  interests: {
    type: [String],
    default: [],
  },

  hobbies: {
    type: [String],
    default: [],
  },
},
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
