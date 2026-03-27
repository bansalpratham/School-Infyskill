const Joi = require('joi');

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const createMeetingDto = Joi.object({
  teacherId: Joi.string().trim().required(),
  title: Joi.string().trim().max(200).required(),
  type: Joi.string().valid('PTA', 'STAFF', 'OTHER').required(),
  date: Joi.string().trim().pattern(dateRegex).required(),
  time: Joi.string().trim().pattern(timeRegex).required(),
  duration: Joi.number().integer().min(1).max(1440).required(),
  location: Joi.string().trim().max(200).optional().allow(''),
  attendees: Joi.array().items(Joi.string().trim().max(120)).optional()
});

module.exports = { createMeetingDto };
