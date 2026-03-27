const mongoose = require('mongoose');
const Timetable = require('../models/timetable.model');

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function ensureObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(400, 'Invalid timetable id');
  }
}

function ensureValidTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return;

  if (String(startTime) >= String(endTime)) {
    throw httpError(400, 'startTime must be earlier than endTime');
  }
}

async function createEntry(payload) {
  ensureValidTimeRange(payload.startTime, payload.endTime);

  const created = await Timetable.create(payload);
  return created;
}

async function listByTeacherId(teacherId) {
  const tid = String(teacherId || '').trim();
  if (!tid) throw httpError(400, 'teacherId is required');

  const items = await Timetable.find({ teacherId: tid })
    .sort({ day: 1, startTime: 1 })
    .lean();

  return items;
}

async function listByClassName(className) {
  const cn = String(className || '').trim();
  if (!cn) throw httpError(400, 'className is required');

  const items = await Timetable.find({ className: cn })
    .sort({ day: 1, startTime: 1 })
    .lean();

  return items;
}

async function updateEntry(id, payload) {
  ensureObjectId(id);

  if (payload.startTime || payload.endTime) {
    const existing = await Timetable.findById(id).lean();
    if (!existing) throw httpError(404, 'Timetable entry not found');

    const start = payload.startTime ?? existing.startTime;
    const end = payload.endTime ?? existing.endTime;
    ensureValidTimeRange(start, end);
  }

  const updated = await Timetable.findByIdAndUpdate(id, { $set: payload }, { new: true, runValidators: true }).lean();
  if (!updated) throw httpError(404, 'Timetable entry not found');
  return updated;
}

async function deleteEntry(id) {
  ensureObjectId(id);

  const deleted = await Timetable.findByIdAndDelete(id).lean();
  if (!deleted) throw httpError(404, 'Timetable entry not found');
  return deleted;
}

module.exports = {
  createEntry,
  listByTeacherId,
  listByClassName,
  updateEntry,
  deleteEntry
};
