const { apiResponse } = require('../utils/apiResponse');
const { httpError } = require('../utils/httpError');
const { createClassDto, updateClassDto } = require('../dto/class.dto');
const {
  createClass,
  listClasses,
  listClassesByTeacher,
  updateClass,
  deleteClass
} = require('../services/class.service');

function ensureSchoolId(req) {
  const v = String(req.schoolId || '').trim();
  if (!v) throw httpError(400, 'schoolId is required');
  return v;
}

async function create(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);

    const payload = await createClassDto.validateAsync(req.body, {
      abortEarly: true,
      stripUnknown: true
    });

    const created = await createClass(schoolId, payload);
    return res.status(201).json(apiResponse(true, 'Class created', created));
  } catch (err) {
    return next(err);
  }
}

async function list(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const items = await listClasses(schoolId);
    return res.status(200).json(apiResponse(true, 'Classes fetched', items));
  } catch (err) {
    return next(err);
  }
}

async function listAssigned(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const teacherId = String(req.query.teacherId || req.user?.userId || '').trim();
    if (!teacherId) throw httpError(400, 'teacherId is required');
    const items = await listClassesByTeacher(schoolId, teacherId);
    return res.status(200).json(apiResponse(true, 'Classes fetched', items));
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);

    const payload = await updateClassDto.validateAsync(req.body, {
      abortEarly: true,
      stripUnknown: true
    });

    const updated = await updateClass(schoolId, req.params.id, payload);
    return res.status(200).json(apiResponse(true, 'Class updated', updated));
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const deleted = await deleteClass(schoolId, req.params.id);
    return res.status(200).json(apiResponse(true, 'Class deleted', deleted));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  create,
  list,
  listAssigned,
  update,
  remove
};
