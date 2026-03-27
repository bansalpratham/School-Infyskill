const Joi = require('joi');

const createRequestDto = Joi.object({
  userId: Joi.string().trim().required(),
  type: Joi.string().valid('LEAVE', 'DOCUMENT').required(),
  reason: Joi.string().trim().max(2000).required()
});

module.exports = { createRequestDto };
