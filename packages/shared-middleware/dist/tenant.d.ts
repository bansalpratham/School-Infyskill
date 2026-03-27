import type { Request, Response, NextFunction } from 'express';
export declare const SCHOOL_ID_HEADER = "x-school-id";
export declare function requireSchoolId(req: Request, res: Response, next: NextFunction): void | Response<any, Record<string, any>>;
//# sourceMappingURL=tenant.d.ts.map