const Joi = require('joi');

const itemDto = Joi.object({
  studentId: Joi.string().trim().required(),
  examName: Joi.string().trim().max(150).required(),
  subject: Joi.string().trim().max(120).required(),
  marks: Joi.number().min(0).max(100).required(),
  grade: Joi.string().trim().max(10).optional(),
  status: Joi.string().valid('PASS', 'FAIL').required()
});

const createResultsBulkDto = Joi.object({
  items: Joi.array().items(itemDto).min(1).required()
});

module.exports = { createResultsBulkDto };
