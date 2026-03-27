const mongoose = require('mongoose');
const Fee = require('../models/fee.model');

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function ensureObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(400, 'Invalid fee id');
  }
}

function normalizeAmounts({ totalAmount, paidAmount }) {
  const total = Number(totalAmount);
  const paid = Number(paidAmount);

  if (!Number.isFinite(total) || total < 0) throw httpError(400, 'Invalid totalAmount');
  if (!Number.isFinite(paid) || paid < 0) throw httpError(400, 'Invalid paidAmount');
  if (paid > total) throw httpError(400, 'paidAmount cannot exceed totalAmount');

  const balance = Number((total - paid).toFixed(2));

  let status = 'PENDING';
  if (paid === 0) status = 'PENDING';
  else if (paid < total) status = 'PARTIAL';
  else status = 'PAID';

  return { totalAmount: total, paidAmount: paid, balanceAmount: balance, status };
}

async function createFee(schoolId, payload) {
  const { studentId, totalAmount, paidAmount = 0 } = payload;
  const computed = normalizeAmounts({ totalAmount, paidAmount });

  const created = await Fee.create({
    schoolId: String(schoolId).trim(),
    studentId,
    ...computed
  });

  return created;
}

async function listFees({ schoolId, page = 1, limit = 10, status, studentId }) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const filter = { schoolId: String(schoolId).trim() };
  if (status) filter.status = status;
  if (studentId) filter.studentId = studentId;

  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Fee.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    Fee.countDocuments(filter)
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

async function getFeesByStudentId(schoolId, studentId) {
  const sid = String(studentId || '').trim();
  if (!sid) throw httpError(400, 'studentId is required');

  const items = await Fee.find({ schoolId: String(schoolId).trim(), studentId: sid })
    .sort({ createdAt: -1 })
    .lean();
  return items;
}

async function applyPayment(schoolId, id, amount) {
  ensureObjectId(id);
  const payAmount = Number(amount);
  if (!Number.isFinite(payAmount) || payAmount <= 0) throw httpError(400, 'Invalid amount');

  const fee = await Fee.findOne({ _id: id, schoolId: String(schoolId).trim() });
  if (!fee) throw httpError(404, 'Fee record not found');

  const nextPaid = Number((fee.paidAmount + payAmount).toFixed(2));
  if (nextPaid > fee.totalAmount) {
    throw httpError(400, 'Payment exceeds totalAmount');
  }

  const computed = normalizeAmounts({ totalAmount: fee.totalAmount, paidAmount: nextPaid });
  fee.paidAmount = computed.paidAmount;
  fee.balanceAmount = computed.balanceAmount;
  fee.status = computed.status;

  await fee.save();
  return fee.toObject();
}

async function getSummary(schoolId) {
  const sid = String(schoolId).trim();
  const [stats] = await Fee.aggregate([
    { $match: { schoolId: sid } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        paidAmount: { $sum: '$paidAmount' },
        balanceAmount: { $sum: '$balanceAmount' }
      }
    }
  ]);

  const totals = await Fee.aggregate([
    { $match: { schoolId: sid } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        paidAmount: { $sum: '$paidAmount' },
        balanceAmount: { $sum: '$balanceAmount' }
      }
    }
  ]);

  const byStatus = { PAID: { count: 0, totalAmount: 0, paidAmount: 0, balanceAmount: 0 }, PARTIAL: { count: 0, totalAmount: 0, paidAmount: 0, balanceAmount: 0 }, PENDING: { count: 0, totalAmount: 0, paidAmount: 0, balanceAmount: 0 } };

  const statusRows = await Fee.aggregate([
    { $match: { schoolId: sid } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        paidAmount: { $sum: '$paidAmount' },
        balanceAmount: { $sum: '$balanceAmount' }
      }
    }
  ]);

  for (const row of statusRows) {
    if (row._id && byStatus[row._id]) {
      byStatus[row._id] = {
        count: row.count || 0,
        totalAmount: row.totalAmount || 0,
        paidAmount: row.paidAmount || 0,
        balanceAmount: row.balanceAmount || 0
      };
    }
  }

  const totalRow = totals[0] || { count: 0, totalAmount: 0, paidAmount: 0, balanceAmount: 0 };

  return {
    totals: {
      count: totalRow.count || 0,
      totalAmount: totalRow.totalAmount || 0,
      paidAmount: totalRow.paidAmount || 0,
      balanceAmount: totalRow.balanceAmount || 0
    },
    byStatus
  };
}

module.exports = {
  createFee,
  listFees,
  getFeesByStudentId,
  applyPayment,
  getSummary
};
