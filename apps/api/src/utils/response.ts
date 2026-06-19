import type { Response } from 'express';
import type { ApiError, ApiSuccess } from '@aura-grid/shared';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  options: { status?: number; cached?: boolean } = {},
): void => {
  const requestId = (res.locals.requestId as string) ?? 'unknown';
  const body: ApiSuccess<T> = {
    success: true,
    data,
    meta: { requestId, ...(options.cached !== undefined ? { cached: options.cached } : {}) },
  };
  res.status(options.status ?? 200).json(body);
};

export const sendError = (
  res: Response,
  error: { code: string; message: string; details?: unknown; status: number },
): void => {
  const requestId = (res.locals.requestId as string) ?? 'unknown';
  const body: ApiError = {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.details !== undefined ? { details: error.details } : {}),
    },
    meta: { requestId },
  };
  res.status(error.status).json(body);
};
