const SubjectModel = require('../models/subject.model');
const { httpError } = require('../utils/httpError');

async function createSubject(schoolId, payload) {
  try {
    return await SubjectModel.create({
      schoolId,
      name: payload.name,
      code: payload.code || undefined,
      description: payload.description || undefined
    });
  } catch (err) {
    if (err && err.code === 11000) {
      throw httpError(409, 'Subject already exists');
    }
    throw err;
  }
}

async function listSubjects(schoolId) {
  return await SubjectModel.find({ schoolId }).sort({ name: 1 }).lean();
}

async function updateSubject(schoolId, id, patch) {
  const update = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.code !== undefined) update.code = patch.code || undefined;
  if (patch.description !== undefined) update.description = patch.description || undefined;

  try {
    const updated = await SubjectModel.findOneAndUpdate({ _id: id, schoolId }, update, {
      new: true,
      runValidators: true
    }).lean();

    if (!updated) throw httpError(404, 'Subject not found');
    return updated;
  } catch (err) {
    if (err && err.code === 11000) {
      throw httpError(409, 'Subject already exists');
    }
    throw err;
  }
}

async function deleteSubject(schoolId, id) {
  const deleted = await SubjectModel.findOneAndDelete({ _id: id, schoolId }).lean();
  if (!deleted) throw httpError(404, 'Subject not found');
  return deleted;
}

module.exports = {
  createSubject,
  listSubjects,
  updateSubject,
  deleteSubject
};
