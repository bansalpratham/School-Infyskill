const jwt = require('jsonwebtoken');
const { apiResponse } = require('../utils/apiResponse');

function verifyToken(req, res, next) {
  if (String(process.env.AUTH_DISABLED || '').toLowerCase() === 'true') {
    req.user = { userId: 'dev', role: 'admin', allowedSchoolIds: ['local-dev'] };
    return next();
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json(apiResponse(false, 'No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json(apiResponse(false, 'Invalid token'));
  }
}

module.exports = verifyToken;
