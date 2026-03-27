const { apiResponse } = require('../utils/apiResponse');
const {
  bulkUpsertAttendance,
  listAttendance,
  listByClass
} = require('../services/attendance.service');

const { bulkAttendanceDto } = require('../dto/create-attendance.dto');

async function createBulk(req, res, next) {
  try {
    const payload = await bulkAttendanceDto.validateAsync(req.body, {
      abortEarly: true,
      stripUnknown: true
    });

    const result = await bulkUpsertAttendance(payload.items);
    return res.status(200).json(apiResponse(true, 'Attendance submitted', result));
  } catch (err) {
    return next(err);
  }
}

async function list(req, res, next) {
  try {
    const { page, limit, teacherId, className, studentId, date, status } = req.query;
    const result = await listAttendance({ page, limit, teacherId, className, studentId, date, status });
    return res.status(200).json(apiResponse(true, 'Attendance fetched', result.items, result.meta));
  } catch (err) {
    return next(err);
  }
}

async function getByClass(req, res, next) {
  try {
    const { date, status, page, limit } = req.query;
    const result = await listByClass(req.params.className, { date, status, page, limit });
    return res.status(200).json(apiResponse(true, 'Attendance fetched', result.items, result.meta));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createBulk,
  list,
  getByClass
};
