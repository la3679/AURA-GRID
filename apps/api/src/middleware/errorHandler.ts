import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { sendError } from '../utils/response.js';

export const notFoundHandler = (_req: Request, res: Response): void => {
  sendError(res, { code: 'NOT_FOUND', message: 'Route not found.', status: 404 });
};

// Express identifies error middleware by its four-arg signature; _next is required.
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error('AppError', { code: err.code, message: err.message });
    }
    sendError(res, {
      code: err.code,
      message: err.message,
      status: err.statusCode,
      ...(err.details !== undefined ? { details: err.details } : {}),
    });
    return;
  }

  logger.error('Unhandled error', { message: (err as Error)?.message });
  sendError(res, {
    code: 'INTERNAL_ERROR',
    // Never leak stack traces / internals in production.
    message: env.isProd ? 'An unexpected error occurred.' : (err as Error)?.message,
    status: 500,
  });
};
