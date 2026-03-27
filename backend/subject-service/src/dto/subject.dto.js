const Joi = require('joi');

const createSubjectDto = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  code: Joi.string().trim().min(1).max(30).optional(),
  description: Joi.string().trim().min(1).max(500).optional()
});

const updateSubjectDto = Joi.object({
  name: Joi.string().trim().min(1).max(100).optional(),
  code: Joi.string().trim().min(1).max(30).optional().allow(''),
  description: Joi.string().trim().min(1).max(500).optional().allow('')
}).min(1);

module.exports = {
  createSubjectDto,
  updateSubjectDto
};
