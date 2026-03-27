const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, trim: true, index: true },
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, required: true, min: 0, default: 0 },
    balanceAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['PAID', 'PARTIAL', 'PENDING'], required: true, index: true }
  },
  { timestamps: true }
);

feeSchema.index({ studentId: 1, createdAt: -1 });

module.exports = mongoose.model('Fee', feeSchema);
