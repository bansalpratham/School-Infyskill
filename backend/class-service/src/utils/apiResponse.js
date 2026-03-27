function apiResponse(success, message, data, meta) {
  const payload = { success, message };
  if (data !== undefined) payload.data = data;
  if (meta !== undefined) payload.meta = meta;
  return payload;
}

module.exports = { apiResponse };
