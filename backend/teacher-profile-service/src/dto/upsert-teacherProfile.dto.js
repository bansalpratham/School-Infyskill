const Joi = require('joi');

const upsertTeacherProfileDto = Joi.object({
  firstName: Joi.string().trim().max(100).required(),
  lastName: Joi.string().trim().max(100).required(),
  email: Joi.string().email().trim().max(320).required(),
  phone: Joi.string().trim().max(30).optional(),
  qualification: Joi.string().trim().max(200).optional(),
  experience: Joi.string().trim().max(200).optional(),
  subjects: Joi.array().items(Joi.string().trim().max(100)).optional(),
  role: Joi.string().trim().max(80).optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').optional()
}).min(1);

module.exports = { upsertTeacherProfileDto };
