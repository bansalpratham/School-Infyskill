const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, trim: true, index: true },
    className: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, trim: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    level: {
      type: String,
      enum: ['SCHOOL', 'DISTRICT', 'STATE', 'NATIONAL'],
      required: true,
      index: true
    },
    date: { type: String, required: true, trim: true, index: true }
  },
  { timestamps: true }
);

achievementSchema.index({ studentId: 1, date: -1 });
achievementSchema.index({ className: 1, category: 1, date: -1 });

module.exports = mongoose.model('Achievement', achievementSchema);
