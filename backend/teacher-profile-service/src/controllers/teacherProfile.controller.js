const { apiResponse } = require('../utils/apiResponse');
const {
  getTeacherProfileById,
  updateTeacherProfile,
  upsertTeacherProfile
} = require('../services/teacherProfile.service');

const { updateTeacherProfileDto } = require('../dto/update-teacherProfile.dto');
const { upsertTeacherProfileDto } = require('../dto/upsert-teacherProfile.dto');

async function getById(req, res, next) {
  try {
    const profile = await getTeacherProfileById(req.params.id);
    return res.status(200).json(apiResponse(true, 'Teacher profile fetched', profile));
  } catch (err) {
    return next(err);
  }
}

async function patch(req, res, next) {
  try {
    const payload = await updateTeacherProfileDto.validateAsync(req.body, {
      abortEarly: true,
      stripUnknown: true
    });

    const updated = await updateTeacherProfile(req.params.id, payload);
    return res.status(200).json(apiResponse(true, 'Teacher profile updated', updated));
  } catch (err) {
    return next(err);
  }
}

async function putUpsert(req, res, next) {
  try {
    const payload = await upsertTeacherProfileDto.validateAsync(req.body, {
      abortEarly: true,
      stripUnknown: true
    });

    const updated = await upsertTeacherProfile(req.params.id, payload);
    return res.status(200).json(apiResponse(true, 'Teacher profile upserted', updated));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getById,
  patch,
  putUpsert
};
