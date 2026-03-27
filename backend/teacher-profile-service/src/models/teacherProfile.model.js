const mongoose = require('mongoose');

const teacherProfileSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 100 },
    lastName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 320 },
    phone: { type: String, trim: true, maxlength: 30 },
    qualification: { type: String, trim: true, maxlength: 200 },
    experience: { type: String, trim: true, maxlength: 200 },
    subjects: { type: [String], default: [], index: true },
    role: { type: String, trim: true, maxlength: 80 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true }
  },
  { timestamps: true }
);

teacherProfileSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('TeacherProfile', teacherProfileSchema);
