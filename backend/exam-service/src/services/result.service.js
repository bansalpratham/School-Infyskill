const Result = require('../models/result.model');

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function ensureObjectId(id) {
  const raw = String(id || '').trim();
  if (!raw) throw httpError(400, 'Invalid result id');
  // Avoid importing mongoose here; rely on Mongo cast errors handled by global error middleware.
}

async function createResult(schoolId, payload) {
  const filter = {
    schoolId: String(schoolId).trim(),
    studentId: String(payload.studentId).trim(),
    examName: String(payload.examName).trim(),
    subject: String(payload.subject).trim()
  };

  const updated = await Result.findOneAndUpdate(
    filter,
    { $set: { ...payload, schoolId: String(schoolId).trim() } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean();

  return updated;
}

async function createResultsBulk(schoolId, items) {
  const safeItems = Array.isArray(items) ? items : [];
  if (!safeItems.length) {
    const err = new Error('items is required');
    err.statusCode = 400;
    throw err;
  }

  const ops = safeItems.map((payload) => {
    const filter = {
      schoolId: String(schoolId).trim(),
      studentId: String(payload.studentId).trim(),
      examName: String(payload.examName).trim(),
      subject: String(payload.subject).trim()
    };

    return {
      updateOne: {
        filter,
        update: { $set: { ...payload, schoolId: String(schoolId).trim() } },
        upsert: true
      }
    };
  });

  const result = await Result.bulkWrite(ops, { ordered: true });
  const count = (result.upsertedCount || 0) + (result.modifiedCount || 0);
  return {
    count,
    meta: {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount
    }
  };
}

async function listResults({ schoolId, page = 1, limit = 10, studentId, examName, subject, status }) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const filter = { schoolId: String(schoolId).trim() };
  if (studentId) filter.studentId = String(studentId).trim();
  if (examName) filter.examName = String(examName).trim();
  if (subject) filter.subject = String(subject).trim();
  if (status) filter.status = status;

  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Result.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    Result.countDocuments(filter)
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

async function getResultsByStudentId(schoolId, studentId) {
  const sid = String(studentId || '').trim();
  if (!sid) {
    const err = new Error('studentId is required');
    err.statusCode = 400;
    throw err;
  }

  const items = await Result.find({ schoolId: String(schoolId).trim(), studentId: sid })
    .sort({ createdAt: -1 })
    .lean();
  return items;
}

async function updateResult(schoolId, id, payload) {
  ensureObjectId(id);
  const updated = await Result.findOneAndUpdate(
    { _id: id, schoolId: String(schoolId).trim() },
    { $set: payload },
    { new: true, runValidators: true }
  ).lean();
  if (!updated) throw httpError(404, 'Result not found');
  return updated;
}

async function deleteResult(schoolId, id) {
  ensureObjectId(id);
  const deleted = await Result.findOneAndDelete({ _id: id, schoolId: String(schoolId).trim() }).lean();
  if (!deleted) throw httpError(404, 'Result not found');
  return deleted;
}

module.exports = {
  createResult,
  createResultsBulk,
  listResults,
  getResultsByStudentId,
  updateResult,
  deleteResult
};
