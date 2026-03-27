export type Role = 'super-admin' | 'admin' | 'teacher' | 'student' | 'parent';
export type ApiResponse<T> = {
    success: boolean;
    message: string;
    data?: T;
};
export type JwtClaims = {
    userId: string;
    role: Role;
    allowedSchoolIds: string[];
};
//# sourceMappingURL=index.d.ts.map