const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    schoolId: { type: String, required: true, trim: true, index: true },
    createdByTeacherId: { type: String, trim: true, index: true },

    className: { type: String, required: true, trim: true, maxlength: 50, index: true },
    subject: { type: String, required: true, trim: true, maxlength: 120, index: true },
    examType: { type: String, required: true, trim: true, maxlength: 50, index: true },

    date: { type: String, required: true, trim: true, index: true },
    startTime: { type: String, required: true, trim: true, maxlength: 10 },
    durationMinutes: { type: Number, required: true, min: 1, max: 24 * 60 },

    totalMarks: { type: Number, required: true, min: 0, max: 1000 },
    syllabus: { type: String, trim: true, maxlength: 2000, default: '' }
  },
  { timestamps: true }
);

examSchema.index({ schoolId: 1, className: 1, date: 1 });

module.exports = mongoose.model('Exam', examSchema);
