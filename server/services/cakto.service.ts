import { createHmac } from 'node:crypto';
import { env } from '../config/env.ts';
import { SERVER_LIMITS } from '../config/limits.ts';
import { safeEqual } from '../utils/signing.ts';
import { maskEmail, parseEmail } from '../validation/email.ts';
import { addAuthorizedEmail, forgetCachedAccess, removeAuthorizedEmail } from './buyers.service.ts';

/*
 * Cakto webhooks (https://docs.cakto.com.br/conceitos/webhooks). The body is
 * { secret, event, data } and the buyer is in data.customer.email. Cakto
 * signs each delivery with `X-Cakto-Signature: v1=<hex HMAC-SHA256 of
 * "<X-Cakto-Timestamp>.<raw body>">`, keyed with the webhook secret; older
 * setups only send the `secret` field. Cakto does not retry non-2xx answers
 * (only network errors and timeouts above 8 s), so handling is idempotent and fast.
 */

export interface CaktoDelivery {
  signature?: string;
  timestamp?: string;
  rawBody?: Buffer;
  body: Record<string, unknown>;
}

export type CaktoAction = 'granted' | 'revoked' | 'ignored' | 'blocked';

export interface CaktoResult {
  event: string;
  orderId: string | null;
  action: CaktoAction;
  reason?: string;
}

const SIGNATURE_VERSION = 'v1=';
/** Approved payments grant access; Cakto sends status "paid" (the others are accepted for safety). */
const GRANT_EVENTS = new Set(['purchase_approved']);
const PAID_STATUSES = new Set(['paid', 'approved', 'paid_out']);
/** A refund request keeps access until the refund actually happens ("refund"). */
const REVOKE_EVENTS = new Set(['refund', 'chargeback']);
const ORDER_ID_PATTERN = /^[\w-]{1,100}$/;
/** Set member for approved orders that arrive without an id. */
const UNKNOWN_ORDER = 'unknown-order';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readText = (value: unknown, maxChars: number) => (typeof value === 'string' ? value.trim().slice(0, maxChars) : '');

/** True when the delivery comes from Cakto: the signature header when present, otherwise the body secret. */
export function isAuthenticCaktoDelivery(
  secret: string,
  { signature, timestamp, rawBody, body }: CaktoDelivery,
  nowSeconds = Math.floor(Date.now() / 1000),
): boolean {
  if (signature) {
    if (!timestamp || !/^\d{1,12}$/.test(timestamp) || !rawBody) return false;
    if (Math.abs(nowSeconds - Number(timestamp)) > SERVER_LIMITS.webhookToleranceSeconds) return false;
    const expected =
      SIGNATURE_VERSION + createHmac('sha256', secret).update(`${timestamp}.`).update(rawBody).digest('hex');
    // While Cakto rotates the algorithm it may send several comma-separated signatures: one valid v1 is enough.
    return signature.split(',').some((candidate) => safeEqual(expected, candidate.trim()));
  }
  return typeof body.secret === 'string' && safeEqual(secret, body.secret);
}

/** With CAKTO_PRODUCT_IDS set, only those products (product id, short id or offer id) count. */
function isConfiguredProduct(order: Record<string, unknown>): boolean {
  const allowed = env.paywall.productIds;
  if (allowed.length === 0) return true;
  const product = isRecord(order.product) ? order.product : {};
  const offer = isRecord(order.offer) ? order.offer : {};
  return [product.id, product.short_id, offer.id].some((id) => typeof id === 'string' && allowed.includes(id));
}

async function handleOrder(event: string, order: unknown): Promise<CaktoResult> {
  if (!isRecord(order)) return { event, orderId: null, action: 'ignored', reason: 'no order data' };
  const orderId = typeof order.id === 'string' && ORDER_ID_PATTERN.test(order.id) ? order.id : null;
  const result = { event, orderId };

  const isGrant = GRANT_EVENTS.has(event);
  if (!isGrant && !REVOKE_EVENTS.has(event)) return { ...result, action: 'ignored', reason: 'event not used' };
  if (!isConfiguredProduct(order)) return { ...result, action: 'ignored', reason: 'other product' };
  const email = parseEmail(isRecord(order.customer) ? order.customer.email : undefined);
  if (!email) return { ...result, action: 'ignored', reason: 'no valid customer e-mail' };

  let outcome: CaktoResult;
  if (isGrant) {
    const status = readText(order.status, 40).toLowerCase();
    if (status && !PAID_STATUSES.has(status)) return { ...result, action: 'ignored', reason: `status ${status}` };
    const granted = await addAuthorizedEmail(email, orderId ?? UNKNOWN_ORDER);
    outcome = granted ? { ...result, action: 'granted' } : { ...result, action: 'blocked', reason: 'order refunded earlier' };
  } else {
    const remaining = await removeAuthorizedEmail(email, orderId ?? undefined);
    outcome = { ...result, action: 'revoked', ...(remaining > 0 ? { reason: `${remaining} other order(s) still active` } : {}) };
  }
  // A cached answer must not delay a new buyer or keep a refunded one in.
  forgetCachedAccess(email);
  console.log(
    `[cakto] ${event} ${orderId?.slice(0, 8) ?? '-'} → ${outcome.action}${outcome.reason ? ` (${outcome.reason})` : ''} · ${maskEmail(email)}`,
  );
  return outcome;
}

/** Applies one delivery. Webhook V2 sends `data` as an array of orders; each one is handled in order. */
export async function handleCaktoEvent(body: Record<string, unknown>): Promise<CaktoResult[]> {
  const event = readText(body.event, 60);
  if (!event) return [{ event: '', orderId: null, action: 'ignored', reason: 'missing event' }];
  const orders = Array.isArray(body.data) ? body.data.slice(0, SERVER_LIMITS.webhookMaxItems) : [body.data];
  const results: CaktoResult[] = [];
  for (const order of orders) results.push(await handleOrder(event, order));
  return results;
}
