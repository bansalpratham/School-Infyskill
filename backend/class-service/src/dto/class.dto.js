const Joi = require('joi');

const createClassDto = Joi.object({
  name: Joi.string().trim().min(1).max(20).required(),
  section: Joi.string().trim().min(1).max(10).required(),
  classTeacherId: Joi.string().trim().min(1).max(100).optional(),
  subjects: Joi.array().items(Joi.string().trim().min(1).max(120)).max(16).optional(),
  room: Joi.string().trim().min(1).max(50).optional()
});

const updateClassDto = Joi.object({
  name: Joi.string().trim().min(1).max(20).optional(),
  section: Joi.string().trim().min(1).max(10).optional(),
  classTeacherId: Joi.string().trim().min(1).max(100).optional().allow(''),
  subjects: Joi.array().items(Joi.string().trim().min(1).max(120)).max(16).optional(),
  room: Joi.string().trim().min(1).max(50).optional().allow('')
}).min(1);

module.exports = {
  createClassDto,
  updateClassDto
};
