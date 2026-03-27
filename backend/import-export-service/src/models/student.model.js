const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 100 },
    lastName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 320 },
    phone: { type: String, trim: true, maxlength: 30 },
    className: { type: String, trim: true, maxlength: 50 },
    rollNumber: { type: String, trim: true, maxlength: 50 },
    admissionId: { type: String, unique: true, sparse: true, trim: true, maxlength: 100 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true }
  },
  { timestamps: true }
);

studentSchema.index({ className: 1, status: 1 });

module.exports = mongoose.model('Student', studentSchema);
