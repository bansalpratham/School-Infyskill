const { apiResponse } = require('../utils/apiResponse');
const {
  createAnnouncement,
  listAnnouncements,
  updateAnnouncementStatusBySchool,
  deleteAnnouncementBySchool,
  markAnnouncementRead,
  markAllAnnouncementsRead
} = require('../services/announcement.service');

const { createAnnouncementDto } = require('../dto/create-announcement.dto');
const { updateStatusDto } = require('../dto/update-announcement.dto');

function ensureSchoolId(req) {
  const sid = String(req.headers['x-school-id'] || '').trim();
  if (!sid) {
    const err = new Error('x-school-id header is required');
    err.statusCode = 400;
    throw err;
  }
  return sid;
}

function getUserId(req) {
  return String(req.user?.userId || req.user?.id || '').trim();
}

function getRole(req) {
  return String(req.user?.role || '').trim();
}

async function create(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const userId = getUserId(req);
    if (!userId) {
      const err = new Error('Invalid token payload (userId missing)');
      err.statusCode = 401;
      throw err;
    }

    const payload = await createAnnouncementDto.validateAsync(req.body, {
      abortEarly: true,
      stripUnknown: true
    });

    const announcement = await createAnnouncement({
      schoolId,
      createdBy: userId,
      ...payload
    });
    return res.status(201).json(apiResponse(true, 'Announcement created', announcement));
  } catch (err) {
    return next(err);
  }
}

async function list(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const role = getRole(req);
    const userId = getUserId(req);
    const { page, limit, status } = req.query;

    const result = await listAnnouncements({ schoolId, role, userId, page, limit, status });
    return res.status(200).json(apiResponse(true, 'Announcements fetched', result.items, result.meta));
  } catch (err) {
    return next(err);
  }
}

async function patchStatus(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const payload = await updateStatusDto.validateAsync(req.body, {
      abortEarly: true,
      stripUnknown: true
    });

    const updated = await updateAnnouncementStatusBySchool({
      schoolId,
      id: req.params.id,
      status: payload.status
    });
    return res.status(200).json(apiResponse(true, 'Announcement status updated', updated));
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const deleted = await deleteAnnouncementBySchool({ schoolId, id: req.params.id });
    return res.status(200).json(apiResponse(true, 'Announcement deleted', deleted));
  } catch (err) {
    return next(err);
  }
}

async function patchRead(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const userId = getUserId(req);
    if (!userId) {
      const err = new Error('Invalid token payload (userId missing)');
      err.statusCode = 401;
      throw err;
    }

    const updated = await markAnnouncementRead({
      schoolId,
      announcementId: req.params.id,
      userId
    });

    return res.status(200).json(apiResponse(true, 'Announcement marked as read', updated));
  } catch (err) {
    return next(err);
  }
}

async function patchReadAll(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const role = getRole(req);
    const userId = getUserId(req);
    if (!userId) {
      const err = new Error('Invalid token payload (userId missing)');
      err.statusCode = 401;
      throw err;
    }

    const { status } = req.query;
    const result = await markAllAnnouncementsRead({ schoolId, role, userId, status });
    return res.status(200).json(apiResponse(true, 'Announcements marked as read', result));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  create,
  list,
  patchStatus,
  patchRead,
  patchReadAll,
  remove
};
