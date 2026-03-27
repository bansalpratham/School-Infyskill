const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: true, trim: true, index: true },
    className: { type: String, required: true, trim: true, maxlength: 50, index: true },
    studentId: { type: String, required: true, trim: true, index: true },
    date: { type: String, required: true, trim: true, index: true },
    status: { type: String, enum: ['PRESENT', 'ABSENT', 'LATE'], required: true, index: true }
  },
  { timestamps: true }
);

attendanceSchema.index({ className: 1, date: 1, studentId: 1 }, { unique: true });
attendanceSchema.index({ teacherId: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
