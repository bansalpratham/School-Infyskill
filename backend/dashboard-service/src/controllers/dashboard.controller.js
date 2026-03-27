const { apiResponse } = require('../utils/apiResponse');
const { getOverview } = require('../services/dashboard.service');

async function overview(req, res, next) {
  try {
    const data = await getOverview();
    return res.status(200).json(apiResponse(true, 'Dashboard overview fetched', data));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  overview
};
