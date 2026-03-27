const { apiResponse } = require('../utils/apiResponse');

function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(apiResponse(false, 'Unauthorized'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(apiResponse(false, 'Access denied'));
    }

    return next();
  };
}

module.exports = authorizeRole;
