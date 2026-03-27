const mongoose = require('mongoose');
const Notification = require('../models/notification.model');

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function ensureObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(400, 'Invalid notification id');
  }
}

async function createNotification(payload) {
  const created = await Notification.create(payload);
  return created;
}

async function listNotificationsByTeacherId(teacherId, { page = 1, limit = 20, isRead, type } = {}) {
  const tid = String(teacherId || '').trim();
  if (!tid) throw httpError(400, 'teacherId is required');

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const filter = { teacherId: tid };
  if (typeof isRead !== 'undefined') {
    if (isRead === 'true' || isRead === true) filter.isRead = true;
    if (isRead === 'false' || isRead === false) filter.isRead = false;
  }
  if (type) filter.type = String(type).trim();

  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    Notification.countDocuments(filter)
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

async function markAsRead(id) {
  ensureObjectId(id);

  const updated = await Notification.findByIdAndUpdate(
    id,
    { $set: { isRead: true } },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) throw httpError(404, 'Notification not found');
  return updated;
}

module.exports = {
  createNotification,
  listNotificationsByTeacherId,
  markAsRead
};
