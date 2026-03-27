import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtClaims, Role } from '@school-hub/shared-types';
import { apiResponse } from '@school-hub/shared-utils';
import { SCHOOL_ID_HEADER } from './tenant';

export type AuthedRequest = Request & {
  user?: JwtClaims;
  schoolId?: string;
};

export function requireAuth(jwtSecret: string) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const auth = String(req.header('authorization') || '');
    const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';

    if (!token) {
      return res.status(401).json(apiResponse(false, 'Unauthorized'));
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as JwtClaims;
      req.user = decoded;
      return next();
    } catch {
      return res.status(401).json(apiResponse(false, 'Unauthorized'));
    }
  };
}

export function requireRole(...roles: Role[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json(apiResponse(false, 'Unauthorized'));
    if (!roles.includes(req.user.role)) return res.status(403).json(apiResponse(false, 'Access denied'));
    return next();
  };
}

export function enforceAllowedSchoolId() {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json(apiResponse(false, 'Unauthorized'));

    const schoolId = String(req.header(SCHOOL_ID_HEADER) || '').trim();
    if (!schoolId) return res.status(400).json(apiResponse(false, `${SCHOOL_ID_HEADER} header is required`));

    const allowed = Array.isArray(req.user.allowedSchoolIds) ? req.user.allowedSchoolIds : [];
    if (!allowed.includes(schoolId)) {
      return res.status(403).json(apiResponse(false, 'Access denied'));
    }

    req.schoolId = schoolId;
    return next();
  };
}
