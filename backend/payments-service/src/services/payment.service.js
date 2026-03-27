const Payment = require('../models/payment.model');

async function createPayment(payload) {
  const created = await Payment.create(payload);
  return created;
}

async function listPayments({ page = 1, limit = 10, studentId }) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const filter = {};
  if (studentId) filter.studentId = String(studentId).trim();

  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    Payment.countDocuments(filter)
  ]);

  return {
    items,
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit)
    }
  };
}

async function getPaymentsByStudentId(studentId) {
  const sid = String(studentId || '').trim();
  if (!sid) {
    const err = new Error('studentId is required');
    err.statusCode = 400;
    throw err;
  }

  const items = await Payment.find({ studentId: sid }).sort({ createdAt: -1 }).lean();
  return items;
}

module.exports = {
  createPayment,
  listPayments,
  getPaymentsByStudentId
};
