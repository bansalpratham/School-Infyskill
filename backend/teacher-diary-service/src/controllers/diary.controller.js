const { apiResponse } = require('../utils/apiResponse');
const { createEntry, listEntries, listByClass } = require('../services/diary.service');

const { createDiaryDto } = require('../dto/create-diary.dto');

async function create(req, res, next) {
  try {
    const payload = await createDiaryDto.validateAsync(req.body, {
      abortEarly: true,
      stripUnknown: true
    });

    const created = await createEntry(payload);
    return res.status(201).json(apiResponse(true, 'Diary entry created', created));
  } catch (err) {
    return next(err);
  }
}

async function list(req, res, next) {
  try {
    const { page, limit, teacherId, className, subject, date } = req.query;
    const result = await listEntries({ page, limit, teacherId, className, subject, date });
    return res.status(200).json(apiResponse(true, 'Diary entries fetched', result.items, result.meta));
  } catch (err) {
    return next(err);
  }
}

async function getByClass(req, res, next) {
  try {
    const { page, limit, date, subject } = req.query;
    const result = await listByClass(req.params.className, { page, limit, date, subject });
    return res.status(200).json(apiResponse(true, 'Diary entries fetched', result.items, result.meta));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  create,
  list,
  getByClass
};
