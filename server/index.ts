import { createApp } from './app.ts';
import { env } from './config/env.ts';
import { getConfiguredModels, verifyGeminiModels } from './services/gemini.service.ts';
import { pingUpstash } from './services/upstash.service.ts';

const app = createApp();

/** Paid access status, plus a read-only Upstash check (PING) when it is on. */
function logPaywall(): void {
  const { paywall } = env;
  if (!paywall.enabled) {
    console.log(
      paywall.upstash
        ? '  Paywall: off (PAYWALL_ENABLED=false) — everyone can use the app.'
        : '  Paywall: off (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set) — everyone can use the app.',
    );
  } else {
    console.log('  Paywall: on · buyers in Upstash Redis · Cakto webhook at POST /api/webhook/cakto');
    if (paywall.upstash) {
      void pingUpstash()
        .then((ok) => console.log(ok ? '[paywall] Upstash connection OK.' : '[paywall] Upstash answered PING unexpectedly.'))
        .catch((error: unknown) => console.error('[paywall] Upstash is not reachable:', error instanceof Error ? error.message : error));
    }
  }
  for (const warning of paywall.warnings) console.warn(`[paywall] ${warning}`);
}

const server = app.listen(env.port, () => {
  console.log(`\n  Prato Rápido API ready on http://localhost:${env.port}`);
  logPaywall();

  if (!env.gemini.apiKey) {
    console.warn('  AI engine: DEMO mode — GEMINI_API_KEY was not found in .env, so sample recipes are served.');
    console.warn('             Get a free key at https://aistudio.google.com/apikey, add it to .env and restart.\n');
    return;
  }
  if (env.demoMode) {
    console.log('  AI engine: DEMO mode (DEMO_MODE=true in .env).\n');
    return;
  }

  console.log(`  AI engine: Gemini · ${getConfiguredModels().join(' → ')}\n`);
  // Metadata-only check: flags retired or misspelled model names right away.
  void verifyGeminiModels().catch((error: unknown) => {
    console.warn('[gemini] Model check skipped:', error instanceof Error ? error.message : error);
  });
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
