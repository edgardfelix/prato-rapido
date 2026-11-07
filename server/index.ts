import app from './app.ts';
import { env } from './config/env.ts';
import { getConfiguredModels, verifyGeminiModels } from './services/gemini.service.ts';
import { pingUpstash } from './services/upstash.service.ts';

/*
 * Entry point. Locally (npm run dev / npm start) and on any Node host it
 * listens on PORT. On Vercel this module is bundled into a Vercel Function
 * (server/scripts/build-vercel.ts) that exports the app: Vercel calls it for
 * each request, so listen() must not run there.
 */

/** Paid access status, plus an optional read-only Upstash check (PING). */
function logPaywall(checkConnection: boolean): void {
  const { paywall } = env;
  if (!paywall.enabled) {
    console.log(
      paywall.upstash
        ? '  Paywall: off (PAYWALL_ENABLED=false) — everyone can use the app.'
        : '  Paywall: off (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set) — everyone can use the app.',
    );
  } else {
    console.log('  Paywall: on · buyers in Upstash Redis · Cakto webhook at POST /api/webhook/cakto');
    if (checkConnection && paywall.upstash) {
      void pingUpstash()
        .then((ok) => console.log(ok ? '[paywall] Upstash connection OK.' : '[paywall] Upstash answered PING unexpectedly.'))
        .catch((error: unknown) => console.error('[paywall] Upstash is not reachable:', error instanceof Error ? error.message : error));
    }
  }
  for (const warning of paywall.warnings) console.warn(`[paywall] ${warning}`);
}

/** AI mode, plus an optional metadata-only check that flags retired or misspelled model names. */
function logAiEngine(checkModels: boolean): void {
  if (!env.gemini.apiKey) {
    if (env.serverless) {
      console.warn('  AI engine: DEMO mode — set GEMINI_API_KEY in the Vercel project (Settings → Environment Variables) and redeploy.');
      return;
    }
    console.warn('  AI engine: DEMO mode — GEMINI_API_KEY was not found in .env, so sample recipes are served.');
    console.warn('             Get a free key at https://aistudio.google.com/apikey, add it to .env and restart.\n');
    return;
  }
  if (env.demoMode) {
    console.log('  AI engine: DEMO mode (DEMO_MODE=true).\n');
    return;
  }

  console.log(`  AI engine: Gemini · ${getConfiguredModels().join(' → ')}\n`);
  if (!checkModels) return;
  void verifyGeminiModels().catch((error: unknown) => {
    console.warn('[gemini] Model check skipped:', error instanceof Error ? error.message : error);
  });
}

function startServer(): void {
  const server = app.listen(env.port, () => {
    console.log(`\n  Prato Rápido API ready on http://localhost:${env.port}`);
    logPaywall(true);
    logAiEngine(true);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${env.port} is already in use. Set another PORT in .env or stop the other process.`);
      process.exit(1);
    }
    throw error;
  });

  function shutdown(signal: NodeJS.Signals) {
    console.log(`\n${signal} received, closing the server...`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5_000).unref();
  }

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

if (env.serverless) {
  // Vercel Function: one configuration summary per cold start in the logs, without network checks.
  logPaywall(false);
  logAiEngine(false);
} else {
  startServer();
}

export default app;
