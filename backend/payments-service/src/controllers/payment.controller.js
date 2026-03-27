const { apiResponse } = require('../utils/apiResponse');
const {
  createPayment,
  listPayments,
  getPaymentsByStudentId
} = require('../services/payment.service');

const { createPaymentDto } = require('../dto/create-payment.dto');

async function create(req, res, next) {
  try {
    const payload = await createPaymentDto.validateAsync(req.body, { abortEarly: true, stripUnknown: true });
    const payment = await createPayment(payload);
    return res.status(201).json(apiResponse(true, 'Payment created', payment));
  } catch (err) {
    return next(err);
  }
}

async function list(req, res, next) {
  try {
    const { page, limit, studentId } = req.query;
    const result = await listPayments({ page, limit, studentId });
    return res.status(200).json(apiResponse(true, 'Payments fetched', result.items, result.meta));
  } catch (err) {
    return next(err);
  }
}

async function getByStudent(req, res, next) {
  try {
    const items = await getPaymentsByStudentId(req.params.studentId);
    return res.status(200).json(apiResponse(true, 'Payments fetched', items));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  create,
  list,
  getByStudent
};
