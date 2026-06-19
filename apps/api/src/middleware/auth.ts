import type { NextFunction, Request, Response } from 'express';
import { AuthError } from '../utils/errors.js';
import { verifyIdToken } from '../services/firebase/authService.js';

/**
 * Require a valid Firebase ID token. The verified UID is stored in res.locals.uid
 * and is the ONLY source of identity for downstream handlers.
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const header = req.header('authorization') ?? '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new AuthError('Missing or malformed Authorization header.');
    }
    const user = await verifyIdToken(token);
    res.locals.uid = user.uid;
    res.locals.email = user.email;
    next();
  } catch (err) {
    next(err);
  }
};
