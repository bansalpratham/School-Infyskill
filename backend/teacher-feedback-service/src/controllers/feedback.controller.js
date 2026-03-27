const { apiResponse } = require('../utils/apiResponse');
const {
  createFeedback,
  listFeedback,
  getFeedbackByStudentId
} = require('../services/feedback.service');

const { createFeedbackDto } = require('../dto/create-feedback.dto');

async function create(req, res, next) {
  try {
    const payload = await createFeedbackDto.validateAsync(req.body, { abortEarly: true, stripUnknown: true });
    const created = await createFeedback(payload);
    return res.status(201).json(apiResponse(true, 'Feedback created', created));
  } catch (err) {
    return next(err);
  }
}

async function list(req, res, next) {
  try {
    const { page, limit, teacherId, studentId, status, category } = req.query;
    const result = await listFeedback({ page, limit, teacherId, studentId, status, category });
    return res.status(200).json(apiResponse(true, 'Feedback fetched', result.items, result.meta));
  } catch (err) {
    return next(err);
  }
}

async function getByStudent(req, res, next) {
  try {
    const items = await getFeedbackByStudentId(req.params.studentId);
    return res.status(200).json(apiResponse(true, 'Feedback fetched', items));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  create,
  list,
  getByStudent
};
