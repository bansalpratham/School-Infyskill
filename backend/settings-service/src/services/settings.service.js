const bcrypt = require("bcryptjs");
const Admin = require("../models/admin.model");
const Notification = require("../models/notification.model");
const School = require("../models/school.model");

const axios = require("axios");

function authBaseUrl() {
  return String(process.env.AUTH_SERVICE_URL || 'http://localhost:5001').trim();
}

function authHeaders(authHeader) {
  const v = String(authHeader || '').trim();
  return v ? { Authorization: v } : undefined;
}

exports.getProfile = async (userId, authHeader) => {
  const response = await axios.get(
    `${authBaseUrl()}/api/auth/user/${userId}`,
    { headers: authHeaders(authHeader) }
  );

  return response.data.data;
};

exports.updateProfile = async (userId, updateData, authHeader) => {
  const response = await axios.put(
    `${authBaseUrl()}/api/auth/user/${userId}`,
    updateData,
    { headers: authHeaders(authHeader) }
  );

  return response.data.data;
};

exports.changePassword = async (userId, currentPassword, newPassword, authHeader) => {
  await axios.put(
    `${authBaseUrl()}/api/auth/change-password/${userId}`,
    {
      currentPassword,
      newPassword
    },
    { headers: authHeaders(authHeader) }
  );
};

exports.getNotifications = async (adminId) => {
  let prefs = await Notification.findOne({ adminId });

  if (!prefs) {
    prefs = await Notification.create({ adminId });
  }

  return prefs;
};

exports.updateNotifications = async (adminId, data) => {
  return Notification.findOneAndUpdate(
    { adminId },
    data,
    { new: true, upsert: true }
  );
};

exports.getSchool = async (schoolId) => {
  const id = String(schoolId || '').trim();
  if (!id) return null;
  return School.findOne({ schoolId: id });
};

exports.updateSchool = async (schoolId, data) => {
  const id = String(schoolId || '').trim();
  if (!id) {
    const err = new Error('x-school-id header is required');
    err.statusCode = 400;
    throw err;
  }

  const payload = { ...(data || {}), schoolId: id };
  return School.findOneAndUpdate(
    { schoolId: id },
    payload,
    { new: true, upsert: true }
  );
};