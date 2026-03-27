const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    schoolId: { type: String, required: true, trim: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    target: { type: String, enum: ['teacher', 'student', 'both'], required: true, index: true },
    targetUserId: { type: String, trim: true, index: true },
    status: { type: String, enum: ['PUBLISHED', 'DRAFT'], required: true, index: true, default: 'PUBLISHED' },
    createdBy: { type: String, required: true, trim: true, maxlength: 200 },
    readBy: { type: [String], default: [], index: true }
  },
  { timestamps: true }
);

announcementSchema.index({ schoolId: 1, status: 1, target: 1, targetUserId: 1, createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
