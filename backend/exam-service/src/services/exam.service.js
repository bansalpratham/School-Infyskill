const Exam = require('../models/exam.model');

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function buildListFilter({ schoolId, className, subject, examType, date }) {
  const filter = { schoolId: String(schoolId).trim() };
  if (className) filter.className = String(className).trim();
  if (subject) filter.subject = String(subject).trim();
  if (examType) filter.examType = String(examType).trim();
  if (date) filter.date = String(date).trim();
  return filter;
}

async function createExam(schoolId, payload) {
  const created = await Exam.create({
    ...payload,
    schoolId: String(schoolId).trim(),
    syllabus: String(payload?.syllabus || '').trim()
  });
  return created;
}

async function listExams({ schoolId, page = 1, limit = 10, className, subject, examType, date }) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 200);

  const filter = buildListFilter({ schoolId, className, subject, examType, date });
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Exam.find(filter).sort({ date: 1, startTime: 1, createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    Exam.countDocuments(filter)
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

async function deleteExam(schoolId, id) {
  const raw = String(id || '').trim();
  if (!raw) throw httpError(400, 'Invalid exam id');

  const removed = await Exam.findOneAndDelete({ _id: raw, schoolId: String(schoolId).trim() }).lean();
  if (!removed) throw httpError(404, 'Exam not found');
  return removed;
}

module.exports = {
  createExam,
  listExams,
  deleteExam
};
