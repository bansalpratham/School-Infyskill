const { apiResponse } = require('../utils/apiResponse');
const {
  createEntry,
  listByTeacherId,
  listByClassName,
  updateEntry,
  deleteEntry
} = require('../services/timetable.service');

const { createTimetableDto } = require('../dto/create-timetable.dto');
const { updateTimetableDto } = require('../dto/update-timetable.dto');

async function create(req, res, next) {
  try {
    const payload = await createTimetableDto.validateAsync(req.body, {
      abortEarly: true,
      stripUnknown: true
    });

    const created = await createEntry(payload);
    return res.status(201).json(apiResponse(true, 'Timetable entry created', created));
  } catch (err) {
    return next(err);
  }
}

async function getByTeacher(req, res, next) {
  try {
    const items = await listByTeacherId(req.params.teacherId);
    return res.status(200).json(apiResponse(true, 'Timetable fetched', items));
  } catch (err) {
    return next(err);
  }
}

async function getByClass(req, res, next) {
  try {
    const items = await listByClassName(req.params.className);
    return res.status(200).json(apiResponse(true, 'Timetable fetched', items));
  } catch (err) {
    return next(err);
  }
}

async function patch(req, res, next) {
  try {
    const payload = await updateTimetableDto.validateAsync(req.body, {
      abortEarly: true,
      stripUnknown: true
    });

    const updated = await updateEntry(req.params.id, payload);
    return res.status(200).json(apiResponse(true, 'Timetable entry updated', updated));
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await deleteEntry(req.params.id);
    return res.status(200).json(apiResponse(true, 'Timetable entry deleted', deleted));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  create,
  getByTeacher,
  getByClass,
  patch,
  remove
};
