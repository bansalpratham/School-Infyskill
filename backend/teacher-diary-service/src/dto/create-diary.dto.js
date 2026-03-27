const Joi = require('joi');

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const createDiaryDto = Joi.object({
  teacherId: Joi.string().trim().required(),
  className: Joi.string().trim().max(50).required(),
  subject: Joi.string().trim().max(120).required(),
  date: Joi.string().trim().pattern(dateRegex).required(),
  homework: Joi.string().trim().max(5000).optional().allow(''),
  remarks: Joi.string().trim().max(5000).optional().allow('')
}).or('homework', 'remarks');

module.exports = { createDiaryDto };
