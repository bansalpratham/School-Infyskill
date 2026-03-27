const { apiResponse } = require('../utils/apiResponse');
const {
  createAchievement,
  listAchievements,
  listAchievementsByStudentId
} = require('../services/achievement.service');

const { createAchievementDto } = require('../dto/create-achievement.dto');

async function create(req, res, next) {
  try {
    const payload = await createAchievementDto.validateAsync(req.body, {
      abortEarly: true,
      stripUnknown: true
    });

    const created = await createAchievement(payload);
    return res.status(201).json(apiResponse(true, 'Achievement created', created));
  } catch (err) {
    return next(err);
  }
}

async function list(req, res, next) {
  try {
    const { page, limit, className, category, level, date } = req.query;
    const result = await listAchievements({ page, limit, className, category, level, date });
    return res.status(200).json(apiResponse(true, 'Achievements fetched', result.items, result.meta));
  } catch (err) {
    return next(err);
  }
}

async function listByStudent(req, res, next) {
  try {
    const { page, limit, className, category, level, date } = req.query;
    const result = await listAchievementsByStudentId(req.params.studentId, {
      page,
      limit,
      className,
      category,
      level,
      date
    });

    return res.status(200).json(apiResponse(true, 'Achievements fetched', result.items, result.meta));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  create,
  list,
  listByStudent
};
