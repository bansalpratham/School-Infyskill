const mongoose = require('mongoose');
const TeacherProfile = require('../models/teacherProfile.model');

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function ensureObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(400, 'Invalid teacher profile id');
  }
}

async function getTeacherProfileById(id) {
  ensureObjectId(id);

  const profile = await TeacherProfile.findById(id).lean();
  if (!profile) throw httpError(404, 'Teacher profile not found');
  return profile;
}

async function updateTeacherProfile(id, payload) {
  ensureObjectId(id);

  const updated = await TeacherProfile.findByIdAndUpdate(id, { $set: payload }, { new: true, runValidators: true }).lean();
  if (!updated) throw httpError(404, 'Teacher profile not found');
  return updated;
}

async function upsertTeacherProfile(id, payload) {
  ensureObjectId(id);

  const updated = await TeacherProfile.findByIdAndUpdate(
    id,
    { $set: payload },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true
    }
  ).lean();

  return updated;
}

module.exports = {
  getTeacherProfileById,
  updateTeacherProfile,
  upsertTeacherProfile
};
