const { apiResponse } = require('../utils/apiResponse');

const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(apiResponse(false, 'Access denied'));
    }
    next();
  };
};

module.exports = authorizeRole;
