const Joi = require('joi');

const createFeeDto = Joi.object({
  studentId: Joi.string().trim().required(),
  totalAmount: Joi.number().min(0).required(),
  paidAmount: Joi.number().min(0).optional().default(0)
});

module.exports = { createFeeDto };
