const Joi = require('joi');

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const updateTimetableDto = Joi.object({
  teacherId: Joi.string().trim().optional(),
  className: Joi.string().trim().max(50).optional(),
  subject: Joi.string().trim().max(120).optional(),
  day: Joi.string().valid('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY').optional(),
  startTime: Joi.string().trim().pattern(timeRegex).optional(),
  endTime: Joi.string().trim().pattern(timeRegex).optional(),
  roomNumber: Joi.string().trim().max(30).optional()
}).min(1);

module.exports = { updateTimetableDto };
