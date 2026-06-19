import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { router } from './routes/index.js';
import { requestId } from './middleware/requestId.js';
import { requestLogger } from './middleware/requestLogger.js';
import { generalLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export const createApp = (): Express => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.clientOrigin.split(',').map((o) => o.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '256kb' }));
  app.use(requestId);
  app.use(requestLogger);
  app.use(generalLimiter);

  app.use('/api', router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
