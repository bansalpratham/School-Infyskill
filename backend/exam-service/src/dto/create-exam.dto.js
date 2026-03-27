const Joi = require('joi');

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^\d{2}:\d{2}$/;

const createExamDto = Joi.object({
  className: Joi.string().trim().max(50).required(),
  subject: Joi.string().trim().max(120).required(),
  examType: Joi.string().trim().max(50).required(),
  date: Joi.string().trim().pattern(dateRegex).required(),
  startTime: Joi.string().trim().pattern(timeRegex).required(),
  durationMinutes: Joi.number().integer().min(1).max(24 * 60).required(),
  totalMarks: Joi.number().min(0).max(1000).required(),
  syllabus: Joi.string().trim().max(2000).optional().allow(''),
  createdByTeacherId: Joi.string().trim().optional()
});

module.exports = { createExamDto };
