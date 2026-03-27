const mongoose = require('mongoose');
const Request = require('../models/request.model');

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function ensureObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(400, 'Invalid request id');
  }
}

async function createRequest(payload) {
  const created = await Request.create(payload);
  return created;
}

async function listRequests({ page = 1, limit = 10, userId, type, status }) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const filter = {};
  if (userId) filter.userId = String(userId).trim();
  if (type) filter.type = type;
  if (status) filter.status = status;

  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Request.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    Request.countDocuments(filter)
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

async function approveRequest(id) {
  ensureObjectId(id);

  const reqDoc = await Request.findById(id);
  if (!reqDoc) throw httpError(404, 'Request not found');
  if (reqDoc.status !== 'PENDING') throw httpError(409, 'Only PENDING requests can be approved');

  reqDoc.status = 'APPROVED';
  await reqDoc.save();

  return reqDoc.toObject();
}

async function rejectRequest(id) {
  ensureObjectId(id);

  const reqDoc = await Request.findById(id);
  if (!reqDoc) throw httpError(404, 'Request not found');
  if (reqDoc.status !== 'PENDING') throw httpError(409, 'Only PENDING requests can be rejected');

  reqDoc.status = 'REJECTED';
  await reqDoc.save();

  return reqDoc.toObject();
}

module.exports = {
  createRequest,
  listRequests,
  approveRequest,
  rejectRequest
};
