const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    phone: String,
    password: String,
    profileImage: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);