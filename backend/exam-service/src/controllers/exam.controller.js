const { apiResponse } = require('../utils/apiResponse');
const { createExamDto } = require('../dto/create-exam.dto');

const { createExam, listExams, deleteExam } = require('../services/exam.service');

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
    const payload = await createExamDto.validateAsync(req.body, { abortEarly: true, stripUnknown: true });

    const created = await createExam(schoolId, {
      ...payload,
      createdByTeacherId: payload.createdByTeacherId || String(req.user?.userId || '').trim() || undefined
    });

    return res.status(201).json(apiResponse(true, 'Exam scheduled', created));
  } catch (err) {
    return next(err);
  }
}

async function list(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const { page, limit, className, subject, examType, date } = req.query;

    const result = await listExams({ schoolId, page, limit, className, subject, examType, date });
    return res.status(200).json(apiResponse(true, 'Exams fetched', result.items, result.meta));
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const removed = await deleteExam(schoolId, req.params.id);
    return res.status(200).json(apiResponse(true, 'Exam deleted', removed));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  create,
  list,
  remove
};
