import type { ApiResponse } from '@school-hub/shared-types';

export function apiResponse<T>(success: boolean, message: string, data?: T): ApiResponse<T> {
  const payload: ApiResponse<T> = { success, message };
  if (data !== undefined) payload.data = data;
  return payload;
}
