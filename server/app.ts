import express, { type Express } from 'express';
import { env } from './config/env.ts';
import { serveClientApp } from './http/clientApp.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import { noStore, originGuard, requestLogger, securityHeaders } from './middleware/security.ts';
import { createApiRouter } from './routes/api.routes.ts';

/** Express application factory (kept separate from `listen` so it can be tested in isolation). */
export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', env.trustProxy ? 1 : false);
  app.use(securityHeaders);

  // Bodies are parsed per route (Content-Type check + size limit), after the cheap guards.
  app.use('/api', requestLogger, originGuard, noStore, createApiRouter());

  // On Vercel the CDN serves dist/ (same headers, see server/scripts/build-vercel.ts): the function only answers /api.
  if (!env.serverless && !serveClientApp(app)) {
    // Development: Vite serves the UI on :5173 and proxies /api here.
    app.get('/', (_req, res) => {
      res
        .type('text')
        .send('Prato Rápido API está no ar. Abra o app em http://localhost:5173 (npm run dev) ou gere o build com npm run build.');
    });
  }

  app.use(errorHandler);
  return app;
}

/** The app instance: server/index.ts listens with it, and on Vercel it is the function's request handler. */
const app = createApp();

export default app;
