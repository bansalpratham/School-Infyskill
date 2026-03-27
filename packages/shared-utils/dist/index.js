"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiResponse = apiResponse;
function apiResponse(success, message, data) {
    const payload = { success, message };
    if (data !== undefined)
        payload.data = data;
    return payload;
}
//# sourceMappingURL=index.js.map