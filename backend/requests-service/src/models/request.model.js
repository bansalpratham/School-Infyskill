const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, trim: true, index: true },
    type: { type: String, enum: ['LEAVE', 'DOCUMENT'], required: true, index: true },
    reason: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING', index: true }
  },
  { timestamps: true }
);

requestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Request', requestSchema);
