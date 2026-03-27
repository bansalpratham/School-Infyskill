const xlsx = require('xlsx');

function readFirstSheetFromBuffer(buffer) {
  const wb = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) {
    const err = new Error('No sheets found in Excel file');
    err.statusCode = 400;
    throw err;
  }
  return wb.Sheets[sheetName];
}

function sheetToJson(sheet) {
  return xlsx.utils.sheet_to_json(sheet, { defval: '' });
}

function normalizeHeaders(row) {
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    out[String(k).trim().toLowerCase()] = v;
  }
  return out;
}

function buildWorkbookFromRows({ sheetName, rows }) {
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(rows);
  xlsx.utils.book_append_sheet(wb, ws, sheetName);
  return wb;
}

function workbookToBuffer(wb) {
  return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

module.exports = {
  readFirstSheetFromBuffer,
  sheetToJson,
  normalizeHeaders,
  buildWorkbookFromRows,
  workbookToBuffer
};
