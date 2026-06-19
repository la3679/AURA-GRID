import { createApp } from './app.js';
import { describeConfig, env } from './config/env.js';
import { logger } from './utils/logger.js';

const app = createApp();

app.listen(env.port, () => {
  logger.info(`AURA-GRID API listening on port ${env.port}`, describeConfig());
  if (!env.firebase.configured) {
    logger.warn('Firebase Admin not configured — auth-protected routes will reject requests.');
  }
  if (!env.gemini.configured) {
    logger.warn('Gemini not configured — AI endpoints will return safe fallback content.');
  }
});
