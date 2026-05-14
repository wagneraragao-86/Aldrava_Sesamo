import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { allowedOrigins } from '../config/env.js';
import { logger } from '../config/logger.js';
import { errorHandler, notFound } from '../middleware/error.js';
import { authRouter } from '../modules/auth/auth.routes.js';
import { callsRouter } from '../modules/calls/calls.routes.js';
import { devicesRouter } from '../modules/devices/devices.routes.js';
import { healthRouter } from '../modules/health/health.routes.js';
import { logsRouter } from '../modules/logs/logs.routes.js';
import { swaggerDocument } from './swagger.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(pinoHttp({ logger }));
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
    }),
  );

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use('/health', healthRouter);
  app.use('/auth', authRouter);
  app.use('/calls', callsRouter);
  app.use('/devices', devicesRouter);
  app.use('/logs', logsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
