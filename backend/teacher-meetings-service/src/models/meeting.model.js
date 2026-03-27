const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: true, trim: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    type: { type: String, enum: ['PTA', 'STAFF', 'OTHER'], required: true, index: true },
    date: { type: String, required: true, trim: true, index: true },
    time: { type: String, required: true, trim: true },
    duration: { type: Number, required: true, min: 1 },
    location: { type: String, trim: true, maxlength: 200 },
    attendees: { type: [String], default: [] },
    meetingAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

meetingSchema.index({ teacherId: 1, meetingAt: 1 });
meetingSchema.index({ meetingAt: 1, type: 1 });

module.exports = mongoose.model('Meeting', meetingSchema);
