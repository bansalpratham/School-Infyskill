"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
exports.enforceAllowedSchoolId = enforceAllowedSchoolId;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const shared_utils_1 = require("@school-hub/shared-utils");
const tenant_1 = require("./tenant");
function requireAuth(jwtSecret) {
    return (req, res, next) => {
        const auth = String(req.header('authorization') || '');
        const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';
        if (!token) {
            return res.status(401).json((0, shared_utils_1.apiResponse)(false, 'Unauthorized'));
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            req.user = decoded;
            return next();
        }
        catch {
            return res.status(401).json((0, shared_utils_1.apiResponse)(false, 'Unauthorized'));
        }
    };
}
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user)
            return res.status(401).json((0, shared_utils_1.apiResponse)(false, 'Unauthorized'));
        if (!roles.includes(req.user.role))
            return res.status(403).json((0, shared_utils_1.apiResponse)(false, 'Access denied'));
        return next();
    };
}
function enforceAllowedSchoolId() {
    return (req, res, next) => {
        if (!req.user)
            return res.status(401).json((0, shared_utils_1.apiResponse)(false, 'Unauthorized'));
        const schoolId = String(req.header(tenant_1.SCHOOL_ID_HEADER) || '').trim();
        if (!schoolId)
            return res.status(400).json((0, shared_utils_1.apiResponse)(false, `${tenant_1.SCHOOL_ID_HEADER} header is required`));
        const allowed = Array.isArray(req.user.allowedSchoolIds) ? req.user.allowedSchoolIds : [];
        if (!allowed.includes(schoolId)) {
            return res.status(403).json((0, shared_utils_1.apiResponse)(false, 'Access denied'));
        }
        req.schoolId = schoolId;
        return next();
    };
}
//# sourceMappingURL=auth.js.map