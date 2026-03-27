const Joi = require('joi');

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const attendanceItemDto = Joi.object({
  teacherId: Joi.string().trim().required(),
  className: Joi.string().trim().max(50).required(),
  studentId: Joi.string().trim().required(),
  date: Joi.string().trim().pattern(dateRegex).required(),
  status: Joi.string().valid('PRESENT', 'ABSENT', 'LATE').required()
});

const bulkAttendanceDto = Joi.object({
  items: Joi.array().items(attendanceItemDto).min(1).required()
});

module.exports = {
  attendanceItemDto,
  bulkAttendanceDto
};
