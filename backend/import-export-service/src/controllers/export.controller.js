const { exportStudentsToExcelBuffer } = require('../services/export.service');

async function exportStudents(req, res, next) {
  try {
    const buffer = await exportStudentsToExcelBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="students.xlsx"');

    return res.status(200).send(buffer);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  exportStudents
};
