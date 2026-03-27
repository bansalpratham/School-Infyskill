const Joi = require('joi');

const updateStatusDto = Joi.object({
  status: Joi.string().valid('PUBLISHED', 'DRAFT').required()
});

module.exports = { updateStatusDto };
