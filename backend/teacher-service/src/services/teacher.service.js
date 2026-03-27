const mongoose = require('mongoose');
const Teacher = require('../models/teacher.model');

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function ensureObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(400, 'Invalid teacher id');
  }
}

async function createTeacher(schoolId, payload) {
  const authUserId = String(payload?.authUserId || '').trim();
  const useAuthIdAsPrimary = authUserId && mongoose.Types.ObjectId.isValid(authUserId);

  const created = await Teacher.create({
    ...(useAuthIdAsPrimary ? { _id: authUserId } : {}),
    ...payload,
    schoolId: String(schoolId).trim()
  });
  return created;
}

async function listTeachers({ schoolId, page = 1, limit = 10, search = '', includeInactive = false }) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const filter = {
    schoolId: String(schoolId).trim(),
    status: includeInactive ? { $in: ['ACTIVE', 'INACTIVE'] } : 'ACTIVE'
  };

  if (search) {
    const q = String(search).trim();
    if (q) {
      filter.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { subjects: { $elemMatch: { $regex: q, $options: 'i' } } }
      ];
    }
  }

  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Teacher.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    Teacher.countDocuments(filter)
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

async function getTeacherById(schoolId, id) {
  ensureObjectId(id);

  const teacher = await Teacher.findOne({ _id: id, schoolId: String(schoolId).trim() }).lean();
  if (!teacher) throw httpError(404, 'Teacher not found');
  return teacher;
}

async function updateTeacher(schoolId, id, payload) {
  ensureObjectId(id);

  const updated = await Teacher.findOneAndUpdate(
    { _id: id, schoolId: String(schoolId).trim() },
    { $set: payload },
    { new: true, runValidators: true }
  ).lean();
  if (!updated) throw httpError(404, 'Teacher not found');
  return updated;
}

async function updateTeacherStatus(schoolId, id, status) {
  ensureObjectId(id);

  const updated = await Teacher.findOneAndUpdate(
    { _id: id, schoolId: String(schoolId).trim() },
    { $set: { status } },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) throw httpError(404, 'Teacher not found');
  return updated;
}

async function softDeleteTeacher(schoolId, id) {
  return updateTeacherStatus(schoolId, id, 'INACTIVE');
}

module.exports = {
  createTeacher,
  listTeachers,
  getTeacherById,
  updateTeacher,
  updateTeacherStatus,
  softDeleteTeacher
};
