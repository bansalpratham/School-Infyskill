const { apiResponse } = require('../utils/apiResponse');
const { httpError } = require('../utils/httpError');
const { createSubjectDto, updateSubjectDto } = require('../dto/subject.dto');
const {
  createSubject,
  listSubjects,
  updateSubject,
  deleteSubject
} = require('../services/subject.service');

function ensureSchoolId(req) {
  const v = String(req.schoolId || '').trim();
  if (!v) throw httpError(400, 'schoolId is required');
  return v;
}

async function create(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);

    const payload = await createSubjectDto.validateAsync(req.body, {
      abortEarly: true,
      stripUnknown: true
    });

    const created = await createSubject(schoolId, payload);
    return res.status(201).json(apiResponse(true, 'Subject created', created));
  } catch (err) {
    return next(err);
  }
}

async function list(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const items = await listSubjects(schoolId);
    return res.status(200).json(apiResponse(true, 'Subjects fetched', items));
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);

    const payload = await updateSubjectDto.validateAsync(req.body, {
      abortEarly: true,
      stripUnknown: true
    });

    const updated = await updateSubject(schoolId, req.params.id, payload);
    return res.status(200).json(apiResponse(true, 'Subject updated', updated));
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const deleted = await deleteSubject(schoolId, req.params.id);
    return res.status(200).json(apiResponse(true, 'Subject deleted', deleted));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  create,
  list,
  update,
  remove
};
