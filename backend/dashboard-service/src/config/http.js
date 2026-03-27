const axios = require('axios');

function createHttpClient({ baseURL, timeoutMs }) {
  return axios.create({
    baseURL,
    timeout: timeoutMs,
    validateStatus: () => true
  });
}

module.exports = { createHttpClient };
