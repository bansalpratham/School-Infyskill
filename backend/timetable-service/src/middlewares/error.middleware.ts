import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { apiResponse } from '@school-hub/shared-utils';

export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  const statusCode = err?.statusCode || err?.status || 500;

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json(apiResponse(false, 'Invalid resource id'));
  }

  if (err && err.code === 11000) {
    const keys = err.keyValue ? Object.keys(err.keyValue) : [];
    const field = keys.length ? keys[0] : 'field';
    return res.status(409).json(apiResponse(false, `${field} already exists`));
  }

  const message = statusCode >= 500 ? 'Internal server error' : err?.message || 'Request failed';

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  return res.status(statusCode).json(apiResponse(false, message));
}
