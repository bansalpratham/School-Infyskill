const Joi = require('joi');

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const createTimetableDto = Joi.object({
  teacherId: Joi.string().trim().required(),
  className: Joi.string().trim().max(50).required(),
  subject: Joi.string().trim().max(120).required(),
  day: Joi.string().valid('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY').required(),
  startTime: Joi.string().trim().pattern(timeRegex).required(),
  endTime: Joi.string().trim().pattern(timeRegex).required(),
  roomNumber: Joi.string().trim().max(30).optional()
});

module.exports = { createTimetableDto };
