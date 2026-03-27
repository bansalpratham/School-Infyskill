const Joi = require('joi');

const updateStudentDto = Joi.object({
  firstName: Joi.string().trim().max(100).optional(),
  lastName: Joi.string().trim().max(100).optional(),
  email: Joi.string().email().trim().max(320).optional(),
  phone: Joi.string().trim().max(30).optional(),
  className: Joi.string().trim().max(50).optional(),
  rollNumber: Joi.string().trim().max(50).optional(),
  admissionId: Joi.string().trim().max(100).optional(),
  customFields: Joi.object().pattern(Joi.string().trim(), Joi.any()).optional()
}).min(1);

const updateStatusDto = Joi.object({
  status: Joi.string().valid('ACTIVE', 'INACTIVE').required()
});

module.exports = { updateStudentDto, updateStatusDto };
