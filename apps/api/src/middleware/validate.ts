import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors.js';

type Source = 'body' | 'query' | 'params';

/** Validate a request segment against a Zod schema, replacing it with the parsed value. */
export const validate =
  (schema: ZodSchema, source: Source = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      next(new ValidationError('Request validation failed', result.error.flatten()));
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any)[source] = result.data;
    next();
  };
