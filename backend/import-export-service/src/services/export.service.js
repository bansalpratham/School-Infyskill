const Student = require('../models/student.model');
const { buildWorkbookFromRows, workbookToBuffer } = require('../utils/xlsx');

async function exportStudentsToExcelBuffer() {
  const students = await Student.find({}).sort({ createdAt: -1 }).lean();

  const rows = students.map((s) => ({
    firstName: s.firstName,
    lastName: s.lastName,
    email: s.email,
    phone: s.phone || '',
    className: s.className || '',
    rollNumber: s.rollNumber || '',
    admissionId: s.admissionId || '',
    status: s.status,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt
  }));

  const wb = buildWorkbookFromRows({ sheetName: 'Students', rows });
  return workbookToBuffer(wb);
}

module.exports = {
  exportStudentsToExcelBuffer
};
