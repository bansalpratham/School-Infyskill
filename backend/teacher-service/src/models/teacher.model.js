const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    schoolId: { type: String, required: true, trim: true, index: true },
    firstName: { type: String, required: true, trim: true, maxlength: 100 },
    lastName: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 320
    },
    phone: { type: String, trim: true, maxlength: 30 },
    subjects: { type: [String], default: [], index: true },
    customFields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true }
  },
  { timestamps: true }
);

teacherSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Teacher', teacherSchema);
