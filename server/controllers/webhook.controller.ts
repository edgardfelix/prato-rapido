import type { Request, Response } from 'express';
import { env } from '../config/env.ts';
import { handleCaktoEvent, isAuthenticCaktoDelivery, type CaktoResult } from '../services/cakto.service.ts';
import { UpstashError } from '../services/upstash.service.ts';
import { badRequest, HttpError } from '../utils/httpError.ts';
import { isRecord } from '../validation/common.ts';

/** Express request with the exact bytes Cakto signed (kept by the JSON parser's `verify` hook). */
type RawBodyRequest = Request & { rawBody?: Buffer };

/** `POST /api/webhook/cakto`: registers approved buyers and removes refunded ones. */
export async function caktoWebhookHandler(req: Request, res: Response): Promise<void> {
  const secret = env.paywall.webhookSecret;
  // Fail closed: without a secret anyone could "approve" their own e-mail.
  if (!secret) throw new HttpError(503, 'NOT_CONFIGURED', 'Webhook da Cakto não configurado (defina CAKTO_WEBHOOK_SECRET).');

  const body: unknown = req.body;
  if (!isRecord(body)) throw badRequest('Envie o evento da Cakto em formato JSON.');

  const authentic = isAuthenticCaktoDelivery(secret, {
    signature: req.get('x-cakto-signature'),
    timestamp: req.get('x-cakto-timestamp'),
    rawBody: (req as RawBodyRequest).rawBody,
    body,
  });
  if (!authentic) throw new HttpError(401, 'UNAUTHORIZED', 'Webhook não autenticado.');

  let results: CaktoResult[];
  try {
    results = await handleCaktoEvent(body);
  } catch (error) {
    if (!(error instanceof UpstashError)) throw error;
    // Cakto does not retry non-2xx answers: the log says how to recover the event.
    console.error('[cakto] Event not stored. Resend it from the Cakto panel ("Reenviar evento") once Upstash is reachable.');
    throw new HttpError(503, 'ACCESS_UNAVAILABLE', 'Não foi possível salvar o evento agora.', { cause: error });
  }

  res.status(200).json({ received: true, actions: results.map((result) => result.action) });
}
