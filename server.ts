import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createApp } from './server/app.js';
import { env } from './server/config/env.js';
import { logger } from './server/utils/logger.js';
import { runMigrations } from './server/db/migrate.js';
import { seedDatabase } from './server/db/seed.js';
import { errorHandler } from './server/middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = createApp();

  // Initialize DB schema & seed demo account
  try {
    await runMigrations();
    await seedDatabase();
  } catch (err: any) {
    logger.error('Database migration/seed notification', err);
  }

  if (env.NODE_ENV !== 'production') {
    // Development mode: Mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve prebuilt client bundle
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Error handler
  app.use(errorHandler);

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    logger.info(`🌱 AgriLens Server listening at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  logger.error('Fatal crash on AgriLens boot', err);
  process.exit(1);
});
