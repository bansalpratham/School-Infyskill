const Joi = require('joi');

const createNotificationDto = Joi.object({
  teacherId: Joi.string().trim().required(),
  title: Joi.string().trim().max(200).required(),
  message: Joi.string().trim().max(5000).required(),
  type: Joi.string().trim().max(80).required(),
  isRead: Joi.boolean().optional()
});

module.exports = { createNotificationDto };
