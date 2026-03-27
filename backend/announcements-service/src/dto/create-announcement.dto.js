const Joi = require('joi');

const createAnnouncementDto = Joi.object({
  title: Joi.string().trim().max(200).required(),
  message: Joi.string().trim().max(5000).required(),
  target: Joi.string().valid('teacher', 'student', 'both').required(),
  targetUserId: Joi.string().trim().max(200).optional(),
  status: Joi.string().valid('PUBLISHED', 'DRAFT').optional()
});

module.exports = { createAnnouncementDto };
