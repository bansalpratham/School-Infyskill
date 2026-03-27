const Joi = require('joi');

const updateResultDto = Joi.object({
  studentId: Joi.string().trim().optional(),
  examName: Joi.string().trim().max(150).optional(),
  subject: Joi.string().trim().max(120).optional(),
  marks: Joi.number().min(0).max(100).optional(),
  grade: Joi.string().trim().max(10).optional(),
  status: Joi.string().valid('PASS', 'FAIL').optional()
}).min(1);

module.exports = { updateResultDto };
