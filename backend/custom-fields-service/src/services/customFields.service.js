const mongoose = require('mongoose');
const CustomField = require('../models/customField.model');

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function ensureObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(400, 'Invalid field id');
  }
}

async function listCustomFields({ schoolId, visibility, enabledOnly = false }) {
  const filter = {
    schoolId: String(schoolId).trim()
  };

  if (enabledOnly) {
    filter.enabled = true;
  }

  if (visibility && visibility !== 'both') {
    const v = String(visibility).trim();
    if (v === 'student' || v === 'teacher') {
      filter.visibility = { $in: [v, 'both'] };
    }
  }

  const items = await CustomField.find(filter).sort({ order: 1, createdAt: 1 }).lean();
  return items;
}

async function ensureMax15(schoolId) {
  const active = await CustomField.countDocuments({ schoolId: String(schoolId).trim(), enabled: true });
  if (active >= 15) {
    throw httpError(400, 'Maximum 15 custom fields allowed');
  }
}

async function createCustomField(schoolId, payload) {
  await ensureMax15(schoolId);

  const filter = { schoolId: String(schoolId).trim() };
  const maxOrderDoc = await CustomField.findOne(filter).sort({ order: -1 }).lean();
  const nextOrder = typeof payload.order === 'number' ? payload.order : (Number(maxOrderDoc?.order || 0) + 1);

  const doc = await CustomField.create({
    ...payload,
    schoolId: String(schoolId).trim(),
    order: nextOrder,
    options: Array.isArray(payload.options) ? payload.options : []
  });

  return doc.toObject();
}

async function updateCustomField(schoolId, id, payload) {
  ensureObjectId(id);

  if (payload.enabled === true) {
    const existing = await CustomField.findOne({ _id: id, schoolId: String(schoolId).trim() }).lean();
    if (!existing) throw httpError(404, 'Field not found');
    if (!existing.enabled) {
      await ensureMax15(schoolId);
    }
  }

  const updated = await CustomField.findOneAndUpdate(
    { _id: id, schoolId: String(schoolId).trim() },
    {
      $set: {
        ...payload,
        ...(payload.type && payload.type !== 'dropdown' ? { options: [] } : {}),
        ...(payload.type === 'dropdown' ? { options: Array.isArray(payload.options) ? payload.options : [] } : {})
      }
    },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) throw httpError(404, 'Field not found');
  return updated;
}

async function deleteCustomField(schoolId, id) {
  ensureObjectId(id);
  const deleted = await CustomField.findOneAndDelete({ _id: id, schoolId: String(schoolId).trim() }).lean();
  if (!deleted) throw httpError(404, 'Field not found');
  return deleted;
}

async function reorderCustomFields(schoolId, ids) {
  const safeIds = Array.from(new Set(ids.map((x) => String(x).trim()).filter(Boolean)));
  if (!safeIds.length) throw httpError(400, 'ids is required');

  const existing = await CustomField.find({ schoolId: String(schoolId).trim(), _id: { $in: safeIds } }).lean();
  const found = new Set(existing.map((x) => String(x._id)));
  const missing = safeIds.filter((x) => !found.has(x));
  if (missing.length) throw httpError(400, 'Some fields were not found');

  const ops = safeIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id, schoolId: String(schoolId).trim() },
      update: { $set: { order: index + 1 } }
    }
  }));

  await CustomField.bulkWrite(ops);
  return true;
}

module.exports = {
  listCustomFields,
  createCustomField,
  updateCustomField,
  deleteCustomField,
  reorderCustomFields
};
