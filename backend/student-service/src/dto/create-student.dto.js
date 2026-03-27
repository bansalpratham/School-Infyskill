const Joi = require('joi');

const createStudentDto = Joi.object({
  authUserId: Joi.string().trim().optional(),
  firstName: Joi.string().trim().max(100).required(),
  lastName: Joi.string().trim().max(100).required(),
  email: Joi.string().email().trim().max(320).required(),
  phone: Joi.string().trim().max(30).optional(),
  className: Joi.string().trim().max(50).optional(),
  rollNumber: Joi.string().trim().max(50).optional(),
  admissionId: Joi.string().trim().max(100).optional(),
  customFields: Joi.object().pattern(Joi.string().trim(), Joi.any()).optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').optional()
});

module.exports = { createStudentDto };
