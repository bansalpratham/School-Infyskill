import type { Request, Response, NextFunction } from 'express';
import type { JwtClaims, Role } from '@school-hub/shared-types';
export type AuthedRequest = Request & {
    user?: JwtClaims;
    schoolId?: string;
};
export declare function requireAuth(jwtSecret: string): (req: AuthedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare function requireRole(...roles: Role[]): (req: AuthedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare function enforceAllowedSchoolId(): (req: AuthedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=auth.d.ts.map