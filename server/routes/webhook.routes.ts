import type { IncomingMessage } from 'node:http';
import express, { Router } from 'express';
import { SERVER_LIMITS } from '../config/limits.ts';
import { caktoWebhookHandler } from '../controllers/webhook.controller.ts';
import { createRateLimiter } from '../middleware/rateLimiter.ts';
import { requireJson } from '../middleware/requestGuards.ts';

/** Keeps the exact bytes Cakto signed: the HMAC covers the raw body, not the re-serialized JSON. */
function keepRawBody(req: IncomingMessage, _res: unknown, buffer: Buffer): void {
  (req as IncomingMessage & { rawBody?: Buffer }).rawBody = Buffer.from(buffer);
}

/** Server-to-server webhooks (mounted at /api/webhook). No human or access token: they authenticate themselves. */
export function createWebhookRouter(): Router {
  const router = Router();

  router.post(
    '/cakto',
    createRateLimiter({ name: 'webhook-cakto', windowMs: 60_000, max: SERVER_LIMITS.webhookPerMinute }),
    requireJson,
    express.json({ limit: SERVER_LIMITS.bodyLimits.webhook, strict: true, verify: keepRawBody }),
    caktoWebhookHandler,
  );

  return router;
}
