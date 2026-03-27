const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema(
  {
    schoolId: { type: String, required: true, index: true },
    schoolName: String,
    phone: String,
    email: String,
    address: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("School", schoolSchema);