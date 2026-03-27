const Attendance = require('../models/attendance.model');

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function bulkUpsertAttendance(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw httpError(400, 'items must be a non-empty array');
  }

  const ops = items.map((it) => ({
    updateOne: {
      filter: { className: it.className, date: it.date, studentId: it.studentId },
      update: { $set: it },
      upsert: true
    }
  }));

  const res = await Attendance.bulkWrite(ops, { ordered: false });

  return {
    upserted: res.upsertedCount || 0,
    modified: res.modifiedCount || 0,
    matched: res.matchedCount || 0
  };
}

async function listAttendance({ page = 1, limit = 10, teacherId, className, studentId, date, status }) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const filter = {};
  if (teacherId) filter.teacherId = String(teacherId).trim();
  if (className) filter.className = String(className).trim();
  if (studentId) filter.studentId = String(studentId).trim();
  if (date) filter.date = String(date).trim();
  if (status) filter.status = status;

  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Attendance.find(filter).sort({ date: -1, createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    Attendance.countDocuments(filter)
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

async function listByClass(className, { date, status, page = 1, limit = 50 } = {}) {
  const cn = String(className || '').trim();
  if (!cn) throw httpError(400, 'className is required');

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);

  const filter = { className: cn };
  if (date) filter.date = String(date).trim();
  if (status) filter.status = status;

  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Attendance.find(filter).sort({ date: -1, studentId: 1 }).skip(skip).limit(safeLimit).lean(),
    Attendance.countDocuments(filter)
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

module.exports = {
  bulkUpsertAttendance,
  listAttendance,
  listByClass
};
