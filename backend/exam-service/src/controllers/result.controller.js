const { apiResponse } = require('../utils/apiResponse');
const {
  createResult,
  createResultsBulk,
  listResults,
  getResultsByStudentId,
  updateResult,
  deleteResult
} = require('../services/result.service');

const { createResultDto } = require('../dto/create-result.dto');
const { createResultsBulkDto } = require('../dto/create-results-bulk.dto');
const { updateResultDto } = require('../dto/update-result.dto');

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
    const payload = await createResultDto.validateAsync(req.body, { abortEarly: true, stripUnknown: true });
    const result = await createResult(schoolId, payload);
    return res.status(201).json(apiResponse(true, 'Result created', result));
  } catch (err) {
    return next(err);
  }
}

async function createBulk(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const payload = await createResultsBulkDto.validateAsync(req.body, { abortEarly: true, stripUnknown: true });
    const result = await createResultsBulk(schoolId, payload.items);
    return res.status(201).json(apiResponse(true, 'Results created', result));
  } catch (err) {
    return next(err);
  }
}

async function list(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const { page, limit, studentId, examName, subject, status } = req.query;
    const result = await listResults({ schoolId, page, limit, studentId, examName, subject, status });
    return res.status(200).json(apiResponse(true, 'Results fetched', result.items, result.meta));
  } catch (err) {
    return next(err);
  }
}

async function getByStudent(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const items = await getResultsByStudentId(schoolId, req.params.studentId);
    return res.status(200).json(apiResponse(true, 'Results fetched', items));
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const payload = await updateResultDto.validateAsync(req.body, { abortEarly: true, stripUnknown: true });
    const result = await updateResult(schoolId, req.params.id, payload);
    return res.status(200).json(apiResponse(true, 'Result updated', result));
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const result = await deleteResult(schoolId, req.params.id);
    return res.status(200).json(apiResponse(true, 'Result deleted', result));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  create,
  createBulk,
  list,
  getByStudent,
  update,
  remove
};
