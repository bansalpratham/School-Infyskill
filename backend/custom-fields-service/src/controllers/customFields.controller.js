const { apiResponse } = require('../utils/apiResponse');
const {
  listCustomFields,
  createCustomField,
  updateCustomField,
  deleteCustomField,
  reorderCustomFields
} = require('../services/customFields.service');

const { createCustomFieldDto, updateCustomFieldDto, reorderDto } = require('../dto/customField.dto');

function ensureSchoolId(req) {
  const v = String(req.header('x-school-id') || '').trim();
  if (!v) {
    const err = new Error('x-school-id header is required');
    err.statusCode = 400;
    throw err;
  }
  return v;
}

async function list(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const visibility = String(req.query.visibility || '').trim().toLowerCase();

    const role = String(req.user?.role || '').trim();
    const enabledOnly = !(role === 'admin' || role === 'super-admin');

    const items = await listCustomFields({ schoolId, visibility, enabledOnly });
    return res.status(200).json(apiResponse(true, 'Custom fields fetched', items));
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const payload = await createCustomFieldDto.validateAsync(req.body, {
      abortEarly: true,
      stripUnknown: true
    });

    const created = await createCustomField(schoolId, payload);
    return res.status(201).json(apiResponse(true, 'Custom field created', created));
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const payload = await updateCustomFieldDto.validateAsync(req.body, {
      abortEarly: true,
      stripUnknown: true
    });

    const updated = await updateCustomField(schoolId, req.params.id, payload);
    return res.status(200).json(apiResponse(true, 'Custom field updated', updated));
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const deleted = await deleteCustomField(schoolId, req.params.id);
    return res.status(200).json(apiResponse(true, 'Custom field deleted', deleted));
  } catch (err) {
    return next(err);
  }
}

async function reorder(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const payload = await reorderDto.validateAsync(req.body, {
      abortEarly: true,
      stripUnknown: true
    });

    await reorderCustomFields(schoolId, payload.ids);
    return res.status(200).json(apiResponse(true, 'Custom fields reordered', { ok: true }));
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create, update, remove, reorder };
