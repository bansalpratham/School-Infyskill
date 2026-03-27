const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: true, trim: true, index: true },
    className: { type: String, required: true, trim: true, maxlength: 50 },
    subject: { type: String, required: true, trim: true, maxlength: 120 },
    day: {
      type: String,
      enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
      required: true,
      index: true
    },
    startTime: { type: String, required: true, trim: true, maxlength: 10 },
    endTime: { type: String, required: true, trim: true, maxlength: 10 },
    roomNumber: { type: String, trim: true, maxlength: 30 }
  },
  { timestamps: true }
);

timetableSchema.index({ teacherId: 1, day: 1, startTime: 1 });

timetableSchema.index(
  { teacherId: 1, day: 1, startTime: 1, endTime: 1, className: 1, subject: 1 },
  { unique: true }
);

module.exports = mongoose.model('Timetable', timetableSchema);
