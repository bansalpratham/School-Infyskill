const { apiResponse } = require('../utils/apiResponse');

function errorMiddleware(err, req, res, next) {
  const status = Number(err?.statusCode || err?.status || 500);
  const message = String(err?.message || 'Internal server error');

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  return res.status(status).json(apiResponse(false, message));
}

module.exports = { errorMiddleware };
