import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { globalLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Route modules
import authRoutes from './routes/auth.routes.js';
import fieldsRoutes from './routes/fields.routes.js';
import scansRoutes from './routes/scans.routes.js';
import compareRoutes from './routes/compare.routes.js';
import chatRoutes from './routes/chat.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import metaRoutes from './routes/meta.routes.js';

export function createApp() {
  const app = express();

  // Trust proxy for production container deployments (Render/Cloud Run)
  app.set('trust proxy', 1);

  // Security Headers with CSP configured for WebGL, Three.js workers, and local blob streams
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: ["'self'", 'data:', 'blob:'],
          workerSrc: ["'self'", 'blob:'],
          connectSrc: ["'self'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com', '*'],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN || true,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(compression());
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  // Global rate limiter
  app.use(globalLimiter);

  // Mount API endpoints under /api/v1
  const apiRouter = express.Router();
  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/fields', fieldsRoutes);
  apiRouter.use('/scans', scansRoutes);
  apiRouter.use('/fields', compareRoutes);
  apiRouter.use('/scans', chatRoutes);
  apiRouter.use('/dashboard', dashboardRoutes);
  apiRouter.use(metaRoutes);

  app.use('/api/v1', apiRouter);

  // Root health endpoint alias
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  return app;
}
