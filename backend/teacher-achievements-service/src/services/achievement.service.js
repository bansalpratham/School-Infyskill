const Achievement = require('../models/achievement.model');

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function buildListFilter({ className, category, level, date, studentId }) {
  const filter = {};

  if (studentId) filter.studentId = String(studentId).trim();
  if (className) filter.className = String(className).trim();
  if (category) filter.category = String(category).trim();
  if (level) filter.level = level;
  if (date) filter.date = String(date).trim();

  return filter;
}

async function createAchievement(payload) {
  const created = await Achievement.create(payload);
  return created;
}

async function listAchievements({ page = 1, limit = 10, className, category, level, date, studentId }) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const filter = buildListFilter({ className, category, level, date, studentId });
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Achievement.find(filter).sort({ date: -1, createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    Achievement.countDocuments(filter)
  ]);

  return {
    items,
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit)
    }
  };
}

async function listAchievementsByStudentId(studentId, { page = 1, limit = 10, className, category, level, date } = {}) {
  const sid = String(studentId || '').trim();
  if (!sid) throw httpError(400, 'studentId is required');

  return listAchievements({ page, limit, className, category, level, date, studentId: sid });
}

module.exports = {
  createAchievement,
  listAchievements,
  listAchievementsByStudentId
};
