const { apiResponse } = require('../utils/apiResponse');
const {
  createTeacher,
  listTeachers,
  getTeacherById,
  updateTeacher,
  updateTeacherStatus,
  softDeleteTeacher
} = require('../services/teacher.service');

const { createTeacherDto } = require('../dto/create-teacher.dto');
const { updateTeacherDto, updateStatusDto } = require('../dto/update-teacher.dto');

function ensureSchoolId(req) {
  const v = String(req.header('x-school-id') || '').trim();
  if (!v) {
    const err = new Error('x-school-id header is required');
    err.statusCode = 400;
    throw err;
  }
  return v;
}

async function create(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const payload = await createTeacherDto.validateAsync(req.body, {
      abortEarly: true,
      stripUnknown: true
    });

    const teacher = await createTeacher(schoolId, payload);
    return res.status(201).json(apiResponse(true, 'Teacher created', teacher));
  } catch (err) {
    return next(err);
  }
}

async function list(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const { page, limit, search, includeInactive } = req.query;
    const result = await listTeachers({
      schoolId,
      page,
      limit,
      search,
      includeInactive: String(includeInactive || '').toLowerCase() === 'true'
    });
    return res.status(200).json(apiResponse(true, 'Teachers fetched', result.items, result.meta));
  } catch (err) {
    return next(err);
  }
}

async function getById(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const teacher = await getTeacherById(schoolId, req.params.id);
    return res.status(200).json(apiResponse(true, 'Teacher fetched', teacher));
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const payload = await updateTeacherDto.validateAsync(req.body, {
      abortEarly: true,
      stripUnknown: true
    });

    const teacher = await updateTeacher(schoolId, req.params.id, payload);
    return res.status(200).json(apiResponse(true, 'Teacher updated', teacher));
  } catch (err) {
    return next(err);
  }
}

async function patchStatus(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const payload = await updateStatusDto.validateAsync(req.body, {
      abortEarly: true,
      stripUnknown: true
    });

    const teacher = await updateTeacherStatus(schoolId, req.params.id, payload.status);
    return res.status(200).json(apiResponse(true, 'Teacher status updated', teacher));
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const teacher = await softDeleteTeacher(schoolId, req.params.id);
    return res.status(200).json(apiResponse(true, 'Teacher deactivated', teacher));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  create,
  list,
  getById,
  update,
  patchStatus,
  remove
};
