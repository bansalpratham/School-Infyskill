const { apiResponse } = require('../utils/apiResponse');
const {
  createStudent,
  listStudents,
  getStudentById,
  updateStudent,
  updateStudentStatus,
  softDeleteStudent
} = require('../services/student.service');

const { createStudentDto } = require('../dto/create-student.dto');
const { updateStudentDto, updateStatusDto } = require('../dto/update-student.dto');

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
    const payload = await createStudentDto.validateAsync(req.body, {
      abortEarly: true,
      stripUnknown: true
    });

    const student = await createStudent(schoolId, payload);
    return res.status(201).json(apiResponse(true, 'Student created', student));
  } catch (err) {
    return next(err);
  }
}

async function list(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const { page, limit, search, className, includeInactive } = req.query;
    const result = await listStudents({
      schoolId,
      page,
      limit,
      search,
      className,
      includeInactive: String(includeInactive || '').toLowerCase() === 'true'
    });
    return res.status(200).json(apiResponse(true, 'Students fetched', result.items, result.meta));
  } catch (err) {
    return next(err);
  }
}

async function getById(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const student = await getStudentById(schoolId, req.params.id);
    return res.status(200).json(apiResponse(true, 'Student fetched', student));
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const payload = await updateStudentDto.validateAsync(req.body, {
      abortEarly: true,
      stripUnknown: true
    });

    const student = await updateStudent(schoolId, req.params.id, payload);
    return res.status(200).json(apiResponse(true, 'Student updated', student));
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

    const student = await updateStudentStatus(schoolId, req.params.id, payload.status);
    return res.status(200).json(apiResponse(true, 'Student status updated', student));
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const student = await softDeleteStudent(schoolId, req.params.id);
    return res.status(200).json(apiResponse(true, 'Student deactivated', student));
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
