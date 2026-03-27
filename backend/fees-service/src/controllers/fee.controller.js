const { apiResponse } = require('../utils/apiResponse');
const {
  createFee,
  listFees,
  getFeesByStudentId,
  applyPayment,
  getSummary
} = require('../services/fee.service');

const { createFeeDto } = require('../dto/create-fee.dto');
const { payFeeDto } = require('../dto/pay-fee.dto');

function ensureSchoolId(req) {
  const v = String(req.header('x-school-id') || '').trim();
  if (!v) {
    const err = new Error('x-school-id header is required');
    err.statusCode = 400;
    throw err;
  }
  return v;
}

async function create(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const payload = await createFeeDto.validateAsync(req.body, { abortEarly: true, stripUnknown: true });
    const fee = await createFee(schoolId, payload);
    return res.status(201).json(apiResponse(true, 'Fee record created', fee));
  } catch (err) {
    return next(err);
  }
}

async function list(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const { page, limit, status, studentId } = req.query;
    const result = await listFees({ schoolId, page, limit, status, studentId });
    return res.status(200).json(apiResponse(true, 'Fees fetched', result.items, result.meta));
  } catch (err) {
    return next(err);
  }
}

async function getByStudent(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const items = await getFeesByStudentId(schoolId, req.params.studentId);
    return res.status(200).json(apiResponse(true, 'Fees fetched', items));
  } catch (err) {
    return next(err);
  }
}

async function pay(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const payload = await payFeeDto.validateAsync(req.body, { abortEarly: true, stripUnknown: true });
    const updated = await applyPayment(schoolId, req.params.id, payload.amount);
    return res.status(200).json(apiResponse(true, 'Payment applied', updated));
  } catch (err) {
    return next(err);
  }
}

async function summary(req, res, next) {
  try {
    const schoolId = ensureSchoolId(req);
    const data = await getSummary(schoolId);
    return res.status(200).json(apiResponse(true, 'Summary fetched', data));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  create,
  list,
  getByStudent,
  pay,
  summary
};
