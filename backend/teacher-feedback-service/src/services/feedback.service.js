const Feedback = require('../models/feedback.model');

async function createFeedback(payload) {
  const created = await Feedback.create(payload);
  return created;
}

async function listFeedback({ page = 1, limit = 10, teacherId, studentId, status, category }) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const filter = {};
  if (teacherId) filter.teacherId = String(teacherId).trim();
  if (studentId) filter.studentId = String(studentId).trim();
  if (status) filter.status = status;
  if (category) filter.category = String(category).trim();

  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Feedback.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    Feedback.countDocuments(filter)
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

async function getFeedbackByStudentId(studentId) {
  const sid = String(studentId || '').trim();
  if (!sid) {
    const err = new Error('studentId is required');
    err.statusCode = 400;
    throw err;
  }

  const items = await Feedback.find({ studentId: sid }).sort({ createdAt: -1 }).lean();
  return items;
}

module.exports = {
  createFeedback,
  listFeedback,
  getFeedbackByStudentId
};
