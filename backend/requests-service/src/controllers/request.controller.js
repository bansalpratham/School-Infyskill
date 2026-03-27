const { apiResponse } = require('../utils/apiResponse');
const {
  createRequest,
  listRequests,
  approveRequest,
  rejectRequest
} = require('../services/request.service');

const { createRequestDto } = require('../dto/create-request.dto');

function getUserId(req) {
  return String(req.user?.userId || req.user?.id || req.user?._id || '').trim();
}

async function create(req, res, next) {
  try {
    const payload = await createRequestDto.validateAsync(req.body, { abortEarly: true, stripUnknown: true });

     // Prevent non-admin users from spoofing userId
    const role = String(req.user?.role || '').trim();
    const tokenUserId = getUserId(req);
    if (role !== 'admin') {
      if (!tokenUserId) {
        const err = new Error('Invalid token payload (userId missing)');
        err.statusCode = 401;
        throw err;
      }
      if (String(payload.userId) !== tokenUserId) {
        const err = new Error('Access denied');
        err.statusCode = 403;
        throw err;
      }
    }

    const created = await createRequest(payload);
    return res.status(201).json(apiResponse(true, 'Request created', created));
  } catch (err) {
    return next(err);
  }
}

async function list(req, res, next) {
  try {
    const { page, limit, userId, type, status } = req.query;

    const role = String(req.user?.role || '').trim();
    const tokenUserId = getUserId(req);
    let effectiveUserId = userId;

    // Non-admin users can only list their own requests.
    if (role !== 'admin') {
      if (!tokenUserId) {
        const err = new Error('Invalid token payload (userId missing)');
        err.statusCode = 401;
        throw err;
      }
      effectiveUserId = tokenUserId;
    }

    const result = await listRequests({ page, limit, userId: effectiveUserId, type, status });
    return res.status(200).json(apiResponse(true, 'Requests fetched', result.items, result.meta));
  } catch (err) {
    return next(err);
  }
}

async function approve(req, res, next) {
  try {
    const updated = await approveRequest(req.params.id);
    return res.status(200).json(apiResponse(true, 'Request approved', updated));
  } catch (err) {
    return next(err);
  }
}

async function reject(req, res, next) {
  try {
    const updated = await rejectRequest(req.params.id);
    return res.status(200).json(apiResponse(true, 'Request rejected', updated));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  create,
  list,
  approve,
  reject
};
