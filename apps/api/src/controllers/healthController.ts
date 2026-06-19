import type { Request, Response } from 'express';
import type { HealthResponse } from '@aura-grid/shared';
import { APP_NAME } from '@aura-grid/shared';
import { env } from '../config/env.js';
import { sendSuccess } from '../utils/response.js';

export const getHealth = (_req: Request, res: Response): void => {
  res.setHeader('Cache-Control', 'no-store');
  const payload: HealthResponse = {
    status: 'ok',
    app: `${APP_NAME} API`,
    env: env.nodeEnv,
    timestamp: new Date().toISOString(),
    services: {
      firebase: env.firebase.configured ? 'configured' : 'missing',
      gemini: env.gemini.configured ? 'configured' : 'missing',
    },
  };
  sendSuccess(res, payload);
};

export const getVersion = (_req: Request, res: Response): void => {
  sendSuccess(res, { app: `${APP_NAME} API`, version: '1.0.0' });
};
