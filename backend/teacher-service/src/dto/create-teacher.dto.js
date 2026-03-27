const Joi = require('joi');

const createTeacherDto = Joi.object({
  authUserId: Joi.string().trim().optional(),
  firstName: Joi.string().trim().max(100).required(),
  lastName: Joi.string().trim().max(100).required(),
  email: Joi.string().email().trim().max(320).required(),
  phone: Joi.string().trim().max(30).optional(),
  subjects: Joi.array().items(Joi.string().trim().max(100)).optional(),
  customFields: Joi.object().pattern(Joi.string().trim(), Joi.any()).optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').optional()
});

module.exports = { createTeacherDto };
