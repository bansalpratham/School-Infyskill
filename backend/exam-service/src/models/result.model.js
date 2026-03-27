const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    schoolId: { type: String, required: true, trim: true, index: true },
    studentId: { type: String, required: true, trim: true, index: true },
    examName: { type: String, required: true, trim: true, maxlength: 150, index: true },
    subject: { type: String, required: true, trim: true, maxlength: 120, index: true },
    marks: { type: Number, required: true, min: 0, max: 100 },
    grade: { type: String, trim: true, maxlength: 10 },
    status: { type: String, enum: ['PASS', 'FAIL'], required: true, index: true }
  },
  { timestamps: true }
);

resultSchema.index({ studentId: 1, createdAt: -1 });
resultSchema.index({ studentId: 1, examName: 1, subject: 1 });

module.exports = mongoose.model('Result', resultSchema);
