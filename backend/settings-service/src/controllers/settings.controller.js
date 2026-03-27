const settingsService = require("../services/settings.service");
const { apiResponse } = require('../utils/apiResponse');

exports.getProfile = async (req, res, next) => {
  try {
    const data = await settingsService.getProfile(req.user.userId, req.headers.authorization);
    return res.status(200).json(apiResponse(true, 'Profile fetched', data));
  } catch (err) {
    return next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const data = await settingsService.updateProfile(req.user.userId, req.body, req.headers.authorization);
    return res.status(200).json(apiResponse(true, 'Profile updated', data));
  } catch (err) {
    return next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    await settingsService.changePassword(req.user.userId, currentPassword, newPassword, req.headers.authorization);

    return res.status(200).json(apiResponse(true, 'Password updated'));
  } catch (err) {
    return next(err);
  }
};

exports.getNotifications = async (req, res, next) => {
  try {
    const data = await settingsService.getNotifications(req.user.userId);
    return res.status(200).json(apiResponse(true, 'Notifications fetched', data));
  } catch (err) {
    return next(err);
  }
};

exports.updateNotifications = async (req, res, next) => {
  try {
    const data = await settingsService.updateNotifications(req.user.userId, req.body);
    return res.status(200).json(apiResponse(true, 'Preferences updated', data));
  } catch (err) {
    return next(err);
  }
};

exports.getSchool = async (req, res, next) => {
  try {
    const schoolId = String(req.headers['x-school-id'] || '').trim();
    const data = await settingsService.getSchool(schoolId);
    return res.status(200).json(apiResponse(true, 'School fetched', data));
  } catch (err) {
    return next(err);
  }
};

exports.updateSchool = async (req, res, next) => {
  try {
    const schoolId = String(req.headers['x-school-id'] || '').trim();
    const data = await settingsService.updateSchool(schoolId, req.body);
    return res.status(200).json(apiResponse(true, 'School updated', data));
  } catch (err) {
    return next(err);
  }
};