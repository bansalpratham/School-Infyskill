const Student = require('../models/student.model');
const Fee = require('../models/fee.model');
const { readFirstSheetFromBuffer, sheetToJson, normalizeHeaders } = require('../utils/xlsx');

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function toNumber(val) {
  const n = Number(val);
  if (!Number.isFinite(n)) return null;
  return n;
}

function normalizeFeeAmounts({ totalAmount, paidAmount }) {
  const total = Number(totalAmount);
  const paid = Number(paidAmount);

  if (!Number.isFinite(total) || total < 0) throw httpError(400, 'Invalid totalAmount');
  if (!Number.isFinite(paid) || paid < 0) throw httpError(400, 'Invalid paidAmount');
  if (paid > total) throw httpError(400, 'paidAmount cannot exceed totalAmount');

  const balance = Number((total - paid).toFixed(2));

  let status = 'PENDING';
  if (paid === 0) status = 'PENDING';
  else if (paid < total) status = 'PARTIAL';
  else status = 'PAID';

  return { totalAmount: total, paidAmount: paid, balanceAmount: balance, status };
}

async function importStudentsFromExcelBuffer(buffer) {
  const sheet = readFirstSheetFromBuffer(buffer);
  const rawRows = sheetToJson(sheet);

  if (!rawRows.length) {
    return { insertedOrUpdated: 0, skipped: 0, errors: [] };
  }

  const ops = [];
  const errors = [];
  let skipped = 0;

  for (let i = 0; i < rawRows.length; i++) {
    const row = normalizeHeaders(rawRows[i]);

    const firstName = String(row.firstname || '').trim();
    const lastName = String(row.lastname || '').trim();
    const email = String(row.email || '').trim().toLowerCase();

    if (!firstName || !lastName || !email) {
      skipped++;
      errors.push({ row: i + 2, message: 'Missing required fields: firstName, lastName, email' });
      continue;
    }

    const payload = {
      firstName,
      lastName,
      email,
      phone: String(row.phone || '').trim() || undefined,
      className: String(row.classname || '').trim() || undefined,
      rollNumber: String(row.rollnumber || '').trim() || undefined,
      admissionId: String(row.admissionid || '').trim() || undefined,
      status: ['ACTIVE', 'INACTIVE'].includes(String(row.status || '').trim().toUpperCase())
        ? String(row.status).trim().toUpperCase()
        : undefined
    };

    ops.push({
      updateOne: {
        filter: { email: payload.email },
        update: { $set: payload },
        upsert: true
      }
    });
  }

  if (!ops.length) {
    return { insertedOrUpdated: 0, skipped, errors };
  }

  const res = await Student.bulkWrite(ops, { ordered: false });
  const insertedOrUpdated = (res.upsertedCount || 0) + (res.modifiedCount || 0);

  return { insertedOrUpdated, skipped, errors };
}

async function importFeesFromExcelBuffer(buffer) {
  const sheet = readFirstSheetFromBuffer(buffer);
  const rawRows = sheetToJson(sheet);

  if (!rawRows.length) {
    return { insertedOrUpdated: 0, skipped: 0, errors: [] };
  }

  const ops = [];
  const errors = [];
  let skipped = 0;

  for (let i = 0; i < rawRows.length; i++) {
    const row = normalizeHeaders(rawRows[i]);

    const studentId = String(row.studentid || '').trim();
    const totalAmount = toNumber(row.totalamount);
    const paidAmount = row.paidamount === '' || row.paidamount === undefined ? 0 : toNumber(row.paidamount);

    if (!studentId || totalAmount === null || paidAmount === null) {
      skipped++;
      errors.push({ row: i + 2, message: 'Missing/invalid fields: studentId, totalAmount, paidAmount' });
      continue;
    }

    let computed;
    try {
      computed = normalizeFeeAmounts({ totalAmount, paidAmount });
    } catch (e) {
      skipped++;
      errors.push({ row: i + 2, message: e.message });
      continue;
    }

    ops.push({
      updateOne: {
        filter: { studentId },
        update: {
          $set: {
            studentId,
            ...computed
          }
        },
        upsert: true
      }
    });
  }

  if (!ops.length) {
    return { insertedOrUpdated: 0, skipped, errors };
  }

  const res = await Fee.bulkWrite(ops, { ordered: false });
  const insertedOrUpdated = (res.upsertedCount || 0) + (res.modifiedCount || 0);

  return { insertedOrUpdated, skipped, errors };
}

module.exports = {
  importStudentsFromExcelBuffer,
  importFeesFromExcelBuffer
};
