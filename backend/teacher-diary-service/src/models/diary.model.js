const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: true, trim: true, index: true },
    className: { type: String, required: true, trim: true, maxlength: 50, index: true },
    subject: { type: String, required: true, trim: true, maxlength: 120, index: true },
    date: { type: String, required: true, trim: true, index: true },
    homework: { type: String, trim: true, maxlength: 5000 },
    remarks: { type: String, trim: true, maxlength: 5000 }
  },
  { timestamps: true }
);

diarySchema.index({ className: 1, date: 1, subject: 1 });
diarySchema.index({ teacherId: 1, date: -1 });

module.exports = mongoose.model('Diary', diarySchema);
