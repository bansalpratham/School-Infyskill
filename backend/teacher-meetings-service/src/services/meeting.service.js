const Meeting = require('../models/meeting.model');

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function toMeetingAt(dateStr, timeStr) {
  const iso = `${dateStr}T${timeStr}:00.000Z`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) throw httpError(400, 'Invalid date/time');
  return d;
}

function buildListFilter({ teacherId, type, date, scope }) {
  const filter = {};

  if (teacherId) filter.teacherId = String(teacherId).trim();
  if (type) filter.type = type;
  if (date) filter.date = String(date).trim();

  if (scope === 'upcoming') {
    filter.meetingAt = { $gte: new Date() };
  }

  if (scope === 'past') {
    filter.meetingAt = { $lt: new Date() };
  }

  return filter;
}

async function createMeeting(payload) {
  const meetingAt = toMeetingAt(payload.date, payload.time);

  const created = await Meeting.create({
    ...payload,
    meetingAt
  });

  return created;
}

async function listMeetings({ page = 1, limit = 10, teacherId, type, date, scope }) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const filter = buildListFilter({ teacherId, type, date, scope });
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Meeting.find(filter).sort({ meetingAt: 1 }).skip(skip).limit(safeLimit).lean(),
    Meeting.countDocuments(filter)
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

async function listMeetingsByTeacherId(teacherId, { page = 1, limit = 10, type, date, scope } = {}) {
  const tid = String(teacherId || '').trim();
  if (!tid) throw httpError(400, 'teacherId is required');

  return listMeetings({ page, limit, teacherId: tid, type, date, scope });
}

module.exports = {
  createMeeting,
  listMeetings,
  listMeetingsByTeacherId
};
