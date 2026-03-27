const { apiResponse } = require('../utils/apiResponse');
const {
  createMeeting,
  listMeetings,
  listMeetingsByTeacherId
} = require('../services/meeting.service');

const { createMeetingDto } = require('../dto/create-meeting.dto');

async function create(req, res, next) {
  try {
    const payload = await createMeetingDto.validateAsync(req.body, {
      abortEarly: true,
      stripUnknown: true
    });

    const created = await createMeeting(payload);
    return res.status(201).json(apiResponse(true, 'Meeting created', created));
  } catch (err) {
    return next(err);
  }
}

async function list(req, res, next) {
  try {
    const { page, limit, teacherId, type, date, scope } = req.query;
    const result = await listMeetings({ page, limit, teacherId, type, date, scope });
    return res.status(200).json(apiResponse(true, 'Meetings fetched', result.items, result.meta));
  } catch (err) {
    return next(err);
  }
}

async function listByTeacher(req, res, next) {
  try {
    const { page, limit, type, date, scope } = req.query;
    const result = await listMeetingsByTeacherId(req.params.teacherId, { page, limit, type, date, scope });
    return res.status(200).json(apiResponse(true, 'Meetings fetched', result.items, result.meta));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  create,
  list,
  listByTeacher
};
