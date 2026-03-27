"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCHOOL_ID_HEADER = void 0;
exports.requireSchoolId = requireSchoolId;
const shared_utils_1 = require("@school-hub/shared-utils");
exports.SCHOOL_ID_HEADER = 'x-school-id';
function requireSchoolId(req, res, next) {
    const schoolId = String(req.header(exports.SCHOOL_ID_HEADER) || '').trim();
    if (!schoolId) {
        return res.status(400).json((0, shared_utils_1.apiResponse)(false, `${exports.SCHOOL_ID_HEADER} header is required`));
    }
    req.schoolId = schoolId;
    return next();
}
//# sourceMappingURL=tenant.js.map