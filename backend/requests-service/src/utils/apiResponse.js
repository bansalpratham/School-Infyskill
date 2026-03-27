function apiResponse(success, message, data = null, meta = null) {
  const payload = { success, message };
  if (data !== null) payload.data = data;
  if (meta !== null) payload.meta = meta;
  return payload;
}

module.exports = { apiResponse };
