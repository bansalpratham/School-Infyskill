const ClassModel = require('../models/class.model');
const { httpError } = require('../utils/httpError');

async function createClass(schoolId, payload) {
  try {
    return await ClassModel.create({
      schoolId,
      name: payload.name,
      section: payload.section,
      classTeacherId: payload.classTeacherId || undefined,
      subjects: Array.isArray(payload.subjects) ? payload.subjects : [],
      room: payload.room || undefined
    });
  } catch (err) {
    if (err && err.code === 11000) {
      throw httpError(409, 'Class already exists');
    }
    throw err;
  }
}

async function listClasses(schoolId) {
  return await ClassModel.find({ schoolId }).sort({ name: 1, section: 1 }).lean();
}

async function listClassesByTeacher(schoolId, teacherId) {
  const tid = String(teacherId || '').trim();
  if (!tid) return [];
  return await ClassModel.find({ schoolId, classTeacherId: tid }).sort({ name: 1, section: 1 }).lean();
}

async function updateClass(schoolId, id, patch) {
  const update = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.section !== undefined) update.section = patch.section;
  if (patch.classTeacherId !== undefined) update.classTeacherId = patch.classTeacherId || undefined;
  if (patch.subjects !== undefined) update.subjects = Array.isArray(patch.subjects) ? patch.subjects : [];
  if (patch.room !== undefined) update.room = patch.room || undefined;

  try {
    const updated = await ClassModel.findOneAndUpdate({ _id: id, schoolId }, update, {
      new: true,
      runValidators: true
    }).lean();

    if (!updated) throw httpError(404, 'Class not found');
    return updated;
  } catch (err) {
    if (err && err.code === 11000) {
      throw httpError(409, 'Class already exists');
    }
    throw err;
  }
}

async function deleteClass(schoolId, id) {
  const deleted = await ClassModel.findOneAndDelete({ _id: id, schoolId }).lean();
  if (!deleted) throw httpError(404, 'Class not found');
  return deleted;
}

module.exports = {
  createClass,
  listClasses,
  listClassesByTeacher,
  updateClass,
  deleteClass
};
