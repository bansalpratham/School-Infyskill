const Joi = require('joi');

const payFeeDto = Joi.object({
  amount: Joi.number().positive().required()
});

module.exports = { payFeeDto };
