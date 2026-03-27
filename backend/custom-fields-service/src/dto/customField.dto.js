const Joi = require('joi');

const fieldType = Joi.string()
  .valid('text', 'number', 'email', 'phone', 'textarea', 'dropdown', 'checkbox', 'date')
  .required();

const visibility = Joi.string().valid('student', 'teacher', 'both').required();

const createCustomFieldDto = Joi.object({
  label: Joi.string().trim().max(100).required(),
  placeholder: Joi.string().trim().max(200).allow('').optional(),
  type: fieldType,
  required: Joi.boolean().optional(),
  options: Joi.array().items(Joi.string().trim().max(100)).optional(),
  visibility,
  order: Joi.number().integer().min(0).optional(),
  enabled: Joi.boolean().optional()
});

const updateCustomFieldDto = Joi.object({
  label: Joi.string().trim().max(100).optional(),
  placeholder: Joi.string().trim().max(200).allow('').optional(),
  type: Joi.string().valid('text', 'number', 'email', 'phone', 'textarea', 'dropdown', 'checkbox', 'date').optional(),
  required: Joi.boolean().optional(),
  options: Joi.array().items(Joi.string().trim().max(100)).optional(),
  visibility: Joi.string().valid('student', 'teacher', 'both').optional(),
  order: Joi.number().integer().min(0).optional(),
  enabled: Joi.boolean().optional()
}).min(1);

const reorderDto = Joi.object({
  ids: Joi.array().items(Joi.string().trim().required()).min(1).required()
});

module.exports = { createCustomFieldDto, updateCustomFieldDto, reorderDto };
