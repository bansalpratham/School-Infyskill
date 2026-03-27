const Joi = require('joi');

const createResultDto = Joi.object({
  studentId: Joi.string().trim().required(),
  examName: Joi.string().trim().max(150).required(),
  subject: Joi.string().trim().max(120).required(),
  marks: Joi.number().min(0).max(100).required(),
  grade: Joi.string().trim().max(10).optional(),
  status: Joi.string().valid('PASS', 'FAIL').required()
});

module.exports = { createResultDto };
