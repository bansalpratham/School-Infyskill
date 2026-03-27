const { apiResponse } = require('../utils/apiResponse');
const {
  importStudentsFromExcelBuffer,
  importFeesFromExcelBuffer
} = require('../services/import.service');

function ensureFile(req) {
  if (!req.file || !req.file.buffer) {
    const err = new Error('Excel file is required (field name: file)');
    err.statusCode = 400;
    throw err;
  }
}

async function importStudents(req, res, next) {
  try {
    ensureFile(req);

    const result = await importStudentsFromExcelBuffer(req.file.buffer);
    return res.status(200).json(apiResponse(true, 'Students import completed', result));
  } catch (err) {
    return next(err);
  }
}

async function importFees(req, res, next) {
  try {
    ensureFile(req);

    const result = await importFeesFromExcelBuffer(req.file.buffer);
    return res.status(200).json(apiResponse(true, 'Fees import completed', result));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  importStudents,
  importFees
};
