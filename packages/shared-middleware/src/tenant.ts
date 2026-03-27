import type { Request, Response, NextFunction } from 'express';
import { apiResponse } from '@school-hub/shared-utils';

export const SCHOOL_ID_HEADER = 'x-school-id';

export function requireSchoolId(req: Request, res: Response, next: NextFunction) {
  const schoolId = String(req.header(SCHOOL_ID_HEADER) || '').trim();
  if (!schoolId) {
    return res.status(400).json(apiResponse(false, `${SCHOOL_ID_HEADER} header is required`));
  }
  (req as any).schoolId = schoolId;
  return next();
}
