const Joi = require('joi');

const createPaymentDto = Joi.object({
  studentId: Joi.string().trim().required(),
  amount: Joi.number().positive().required(),
  paymentMode: Joi.string().trim().max(50).required(),
  transactionId: Joi.string().trim().max(150).required()
});

module.exports = { createPaymentDto };
