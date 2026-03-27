const Joi = require('joi');

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const createAchievementDto = Joi.object({
  studentId: Joi.string().trim().required(),
  className: Joi.string().trim().required(),
  category: Joi.string().trim().required(),
  title: Joi.string().trim().max(200).required(),
  description: Joi.string().trim().max(2000).optional().allow(''),
  level: Joi.string().valid('SCHOOL', 'DISTRICT', 'STATE', 'NATIONAL').required(),
  date: Joi.string().trim().pattern(dateRegex).required()
});

module.exports = { createAchievementDto };
