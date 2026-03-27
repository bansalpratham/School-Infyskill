const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: true, trim: true, index: true },
    studentId: { type: String, required: true, trim: true, index: true },
    parentName: { type: String, required: true, trim: true, maxlength: 200 },
    category: { type: String, required: true, trim: true, maxlength: 120, index: true },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    reply: { type: String, trim: true, maxlength: 5000, default: '' },
    status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN', index: true }
  },
  { timestamps: true }
);

feedbackSchema.index({ studentId: 1, createdAt: -1 });
feedbackSchema.index({ teacherId: 1, createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
