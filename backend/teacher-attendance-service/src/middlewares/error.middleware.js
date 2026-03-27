const mongoose = require('mongoose');
const { apiResponse } = require('../utils/apiResponse');

function errorMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json(apiResponse(false, 'Invalid resource id'));
  }

  if (err && err.code === 11000) {
    const keys = err.keyValue ? Object.keys(err.keyValue) : [];
    const field = keys.length ? keys[0] : 'field';
    return res.status(409).json(apiResponse(false, `${field} already exists`));
  }

  if (err && err.isJoi && Array.isArray(err.details)) {
    return res.status(400).json(apiResponse(false, err.details[0]?.message || 'Validation error'));
  }

  const message = statusCode >= 500 ? 'Internal server error' : err.message || 'Request failed';

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  return res.status(statusCode).json(apiResponse(false, message));
}

module.exports = { errorMiddleware };
