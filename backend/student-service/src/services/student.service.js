const mongoose = require('mongoose');
const Student = require('../models/student.model');

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function ensureObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(400, 'Invalid student id');
  }
}

async function createStudent(schoolId, payload) {
  const authUserId = String(payload?.authUserId || '').trim();
  const useAuthIdAsPrimary = authUserId && mongoose.Types.ObjectId.isValid(authUserId);

  const created = await Student.create({
    ...(useAuthIdAsPrimary ? { _id: authUserId } : {}),
    ...payload,
    schoolId: String(schoolId).trim()
  });
  return created;
}

async function listStudents({ schoolId, page = 1, limit = 10, search = '', className = '', includeInactive = false }) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const filter = {
    schoolId: String(schoolId).trim(),
    status: includeInactive ? { $in: ['ACTIVE', 'INACTIVE'] } : 'ACTIVE'
  };

  if (className) {
    filter.className = className;
  }

  if (search) {
    const q = String(search).trim();
    if (q) {
      filter.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { className: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }
  }

  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Student.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    Student.countDocuments(filter)
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

async function getStudentById(schoolId, id) {
  ensureObjectId(id);

  const student = await Student.findOne({ _id: id, schoolId: String(schoolId).trim() }).lean();
  if (!student) throw httpError(404, 'Student not found');
  return student;
}

async function updateStudent(schoolId, id, payload) {
  ensureObjectId(id);

  const updated = await Student.findOneAndUpdate(
    { _id: id, schoolId: String(schoolId).trim() },
    { $set: payload },
    { new: true, runValidators: true }
  ).lean();
  if (!updated) throw httpError(404, 'Student not found');
  return updated;
}

async function updateStudentStatus(schoolId, id, status) {
  ensureObjectId(id);

  const updated = await Student.findOneAndUpdate(
    { _id: id, schoolId: String(schoolId).trim() },
    { $set: { status } },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) throw httpError(404, 'Student not found');
  return updated;
}

async function softDeleteStudent(schoolId, id) {
  return updateStudentStatus(schoolId, id, 'INACTIVE');
}

module.exports = {
  createStudent,
  listStudents,
  getStudentById,
  updateStudent,
  updateStudentStatus,
  softDeleteStudent
};
