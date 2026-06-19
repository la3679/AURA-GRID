import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { sendError } from '../utils/response.js';

export const generalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) =>
    sendError(res, {
      code: 'RATE_LIMIT',
      message: 'Too many requests. Please slow down.',
      status: 429,
    }),
});

/** Tighter limit for AI endpoints, which proxy paid Gemini calls. */
export const aiLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.aiMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) =>
    sendError(res, {
      code: 'RATE_LIMIT',
      message: 'AI request limit reached. Try again shortly.',
      status: 429,
    }),
});
