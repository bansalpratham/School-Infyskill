const Joi = require('joi');

const createFeedbackDto = Joi.object({
  teacherId: Joi.string().trim().required(),
  studentId: Joi.string().trim().required(),
  parentName: Joi.string().trim().max(200).required(),
  category: Joi.string().trim().max(120).required(),
  message: Joi.string().trim().max(5000).required(),
  reply: Joi.string().trim().max(5000).optional().allow(''),
  status: Joi.string().valid('OPEN', 'CLOSED').optional()
});

module.exports = { createFeedbackDto };
