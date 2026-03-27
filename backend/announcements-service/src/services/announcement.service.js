const mongoose = require('mongoose');
const Announcement = require('../models/announcement.model');

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function ensureObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(400, 'Invalid announcement id');
  }
}

async function createAnnouncement(payload) {
  const created = await Announcement.create(payload);
  return created;
}

function buildTargetFilter(role) {
  if (role === 'teacher') return { $in: ['teacher', 'both'] };
  if (role === 'student') return { $in: ['student', 'both'] };
  return undefined;
}

function buildAudienceOrFilter({ role, userId }) {
  const uid = String(userId || '').trim();
  const target = buildTargetFilter(role);

  // Admin: no audience filter.
  if (!target) return undefined;

  // Role-based announcements are those without a targetUserId.
  const roleScoped = { target, $or: [{ targetUserId: { $exists: false } }, { targetUserId: null }, { targetUserId: '' }] };

  if (!uid) return roleScoped;

  return {
    $or: [
      roleScoped,
      { targetUserId: uid }
    ]
  };
}

async function listAnnouncements({
  schoolId,
  role,
  userId,
  page = 1,
  limit = 10,
  status
}) {
  const sid = String(schoolId || '').trim();
  if (!sid) throw httpError(400, 'schoolId is required');

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const filter = { schoolId: sid };
  const audienceOr = buildAudienceOrFilter({ role, userId });
  if (audienceOr) Object.assign(filter, audienceOr);
  if (status) filter.status = String(status).trim();

  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Announcement.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    Announcement.countDocuments(filter)
  ]);

  const uid = String(userId || '').trim();
  const mapped = items.map((a) => {
    const readBy = Array.isArray(a.readBy) ? a.readBy : [];
    const isRead = uid ? readBy.includes(uid) : false;
    return { ...a, isRead };
  });

  return {
    items: mapped,
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit)
    }
  };
}

async function updateAnnouncementStatus(id, status) {
  throw httpError(500, 'updateAnnouncementStatus requires schoolId (use updateAnnouncementStatusBySchool)');
}

async function updateAnnouncementStatusBySchool({ schoolId, id, status }) {
  const sid = String(schoolId || '').trim();
  if (!sid) throw httpError(400, 'schoolId is required');
  ensureObjectId(id);

  const updated = await Announcement.findOneAndUpdate(
    { _id: id, schoolId: sid },
    { $set: { status } },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) throw httpError(404, 'Announcement not found');
  return updated;
}

async function deleteAnnouncementBySchool({ schoolId, id }) {
  const sid = String(schoolId || '').trim();
  if (!sid) throw httpError(400, 'schoolId is required');
  ensureObjectId(id);

  const deleted = await Announcement.findOneAndDelete({ _id: id, schoolId: sid }).lean();
  if (!deleted) throw httpError(404, 'Announcement not found');
  return deleted;
}

async function markAnnouncementRead({ schoolId, announcementId, userId }) {
  const sid = String(schoolId || '').trim();
  const uid = String(userId || '').trim();
  if (!sid) throw httpError(400, 'schoolId is required');
  if (!uid) throw httpError(400, 'userId is required');
  ensureObjectId(announcementId);

  const updated = await Announcement.findOneAndUpdate(
    { _id: announcementId, schoolId: sid },
    { $addToSet: { readBy: uid } },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) throw httpError(404, 'Announcement not found');
  return { ...updated, isRead: true };
}

async function markAllAnnouncementsRead({ schoolId, role, userId, status }) {
  const sid = String(schoolId || '').trim();
  const uid = String(userId || '').trim();
  if (!sid) throw httpError(400, 'schoolId is required');
  if (!uid) throw httpError(400, 'userId is required');

  const filter = { schoolId: sid };
  const audienceOr = buildAudienceOrFilter({ role, userId: uid });
  if (audienceOr) Object.assign(filter, audienceOr);
  if (status) filter.status = String(status).trim();

  const res = await Announcement.updateMany(filter, { $addToSet: { readBy: uid } });
  return {
    matched: res.matchedCount ?? res.n,
    modified: res.modifiedCount ?? res.nModified
  };
}

module.exports = {
  createAnnouncement,
  listAnnouncements,
  updateAnnouncementStatus,
  updateAnnouncementStatusBySchool,
  deleteAnnouncementBySchool,
  markAnnouncementRead,
  markAllAnnouncementsRead
};
