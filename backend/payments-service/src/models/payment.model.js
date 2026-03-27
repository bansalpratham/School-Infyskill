const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, trim: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    paymentMode: { type: String, required: true, trim: true, maxlength: 50 },
    transactionId: { type: String, required: true, unique: true, trim: true, maxlength: 150 }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

paymentSchema.index({ studentId: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
