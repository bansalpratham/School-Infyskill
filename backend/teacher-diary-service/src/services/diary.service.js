const Diary = require('../models/diary.model');

async function createEntry(payload) {
  const created = await Diary.create(payload);
  return created;
}

async function listEntries({ page = 1, limit = 10, teacherId, className, subject, date }) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const filter = {};
  if (teacherId) filter.teacherId = String(teacherId).trim();
  if (className) filter.className = String(className).trim();
  if (subject) filter.subject = String(subject).trim();
  if (date) filter.date = String(date).trim();

  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Diary.find(filter).sort({ date: -1, createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    Diary.countDocuments(filter)
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

async function listByClass(className, { page = 1, limit = 50, date, subject } = {}) {
  const cn = String(className || '').trim();
  if (!cn) {
    const err = new Error('className is required');
    err.statusCode = 400;
    throw err;
  }

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);

  const filter = { className: cn };
  if (date) filter.date = String(date).trim();
  if (subject) filter.subject = String(subject).trim();

  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Diary.find(filter).sort({ date: -1, subject: 1 }).skip(skip).limit(safeLimit).lean(),
    Diary.countDocuments(filter)
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
  createEntry,
  listEntries,
  listByClass
};
