const { apiResponse } = require('../utils/apiResponse');
const {
  createNotification,
  listNotificationsByTeacherId,
  markAsRead
} = require('../services/notification.service');

const { createNotificationDto } = require('../dto/create-notification.dto');

async function create(req, res, next) {
  try {
    const payload = await createNotificationDto.validateAsync(req.body, { abortEarly: true, stripUnknown: true });
    const created = await createNotification(payload);
    return res.status(201).json(apiResponse(true, 'Notification created', created));
  } catch (err) {
    return next(err);
  }
}

async function listByTeacher(req, res, next) {
  try {
    const { page, limit, isRead, type } = req.query;
    const result = await listNotificationsByTeacherId(req.params.teacherId, { page, limit, isRead, type });
    return res.status(200).json(apiResponse(true, 'Notifications fetched', result.items, result.meta));
  } catch (err) {
    return next(err);
  }
}

async function patchRead(req, res, next) {
  try {
    const updated = await markAsRead(req.params.id);
    return res.status(200).json(apiResponse(true, 'Notification marked as read', updated));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  create,
  listByTeacher,
  patchRead
};
