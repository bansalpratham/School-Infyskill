const { apiResponse } = require('../utils/apiResponse');

function errorMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;

  const message = statusCode >= 500 ? 'Internal server error' : err.message || 'Request failed';

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  return res.status(statusCode).json(apiResponse(false, message));
}

module.exports = { errorMiddleware };
