import { createHmac } from 'node:crypto';
import { env } from '../config/env.ts';
import { SERVER_LIMITS } from '../config/limits.ts';
import { parseEmail } from '../validation/email.ts';
import { upstashCommand, UpstashError } from './upstash.service.ts';

/*
 * Who may activate the app, in Upstash Redis (no SQL, no Supabase). Two sources:
 *
 * 1. Landing page grants (the main one). Cakto calls the lp-pratorapido
 *    webhook, which stores `{prefix}grant:{hmac}` = AccessGrant JSON
 *    ({ status: 'active' | 'revoked', orders, createdAt, updatedAt }). A
 *    refund, chargeback or cancellation flips the status to 'revoked'.
 *
 * 2. This app's own list. `buyer:<email>` is a SET of the order ids that grant
 *    access (this app's Cakto webhook, or `npm run buyers -- add`): EXISTS
 *    means "authorized", and Redis drops a set when its last member goes, so
 *    refunding one of two orders keeps the access paid by the other.
 *    `refund:<orderId>` remembers refunded orders for a while, so a late retry
 *    of purchase_approved can never bring a refunded order back. Both writes
 *    are Lua scripts (EVAL), so each one is atomic.
 */

/** Where an e-mail's access comes from. */
export type AccessSource = 'landing-page' | 'buyer-list';

/**
 * Redis key of a landing page grant. Mirrors lp-pratorapido
 * (server/src/lib/crypto.ts deriveKey + hmacHex, server/src/store/redis.ts):
 * hmac = HMAC-SHA256(key = HMAC-SHA256(ACCESS_TOKEN_SECRET, 'pratorapido:email-key'), email).
 * The e-mail never appears in the key, which is why this app needs the same
 * secret. E-mails arrive here already normalized and validated (lowercase,
 * printable ASCII, no spaces), exactly what the landing page's normalizeEmail
 * gives for any valid address.
 */
export function landingGrantKey(email: string, landing: { secret: string; prefix: string }): string {
  const emailKey = createHmac('sha256', landing.secret).update('pratorapido:email-key').digest();
  return `${landing.prefix}grant:${createHmac('sha256', emailKey).update(email).digest('hex')}`;
}

/** True for a landing page grant whose status is still 'active'. */
export function isActiveLandingGrant(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  try {
    const grant: unknown = JSON.parse(value);
    return typeof grant === 'object' && grant !== null && (grant as { status?: unknown }).status === 'active';
  } catch {
    return false;
  }
}

/** Order id used for access granted by hand (e.g. `npm run buyers -- add <email>`). */
export const MANUAL_ORDER = 'manual';

const ORDER_ID_PATTERN = /^[\w-]{1,100}$/;

const buyerKey = (email: string) => `buyer:${email}`;
const refundKey = (orderId: string) => `refund:${orderId}`;

export const GRANT_SCRIPT = `
if redis.call('EXISTS', KEYS[2]) == 1 then return 0 end
if redis.call('EXISTS', KEYS[1]) == 1 and redis.call('TYPE', KEYS[1])['ok'] ~= 'set' then redis.call('DEL', KEYS[1]) end
redis.call('SADD', KEYS[1], ARGV[1])
return 1`;

export const REVOKE_SCRIPT = `
redis.call('SET', KEYS[2], '1', 'EX', ARGV[2])
if redis.call('EXISTS', KEYS[1]) == 0 then return 0 end
if redis.call('TYPE', KEYS[1])['ok'] ~= 'set' then redis.call('DEL', KEYS[1]) return 0 end
redis.call('SREM', KEYS[1], ARGV[1])
return redis.call('SCARD', KEYS[1])`;

function requireEmail(value: string): string {
  const email = parseEmail(value);
  if (!email) throw new TypeError('Invalid e-mail address.');
  return email;
}

function requireOrderId(value: string): string {
  if (!ORDER_ID_PATTERN.test(value)) throw new TypeError('Invalid order id.');
  return value;
}

/**
 * Grants access to `email` through `orderId`. Returns false (and changes
 * nothing) when that order was refunded before.
 */
export async function addAuthorizedEmail(email: string, orderId: string = MANUAL_ORDER): Promise<boolean> {
  const buyer = requireEmail(email);
  const order = requireOrderId(orderId);
  const result = await upstashCommand(['EVAL', GRANT_SCRIPT, 2, buyerKey(buyer), refundKey(order), order]);
  return result === 1;
}

/**
 * Removes the access granted by `orderId` and remembers the refund. Without
 * an order id the buyer is removed entirely. Returns how many orders still
 * grant access (0 = no access left).
 */
export async function removeAuthorizedEmail(email: string, orderId?: string): Promise<number> {
  const buyer = requireEmail(email);
  if (orderId === undefined) {
    await upstashCommand(['DEL', buyerKey(buyer)]);
    return 0;
  }
  const order = requireOrderId(orderId);
  const result = await upstashCommand(['EVAL', REVOKE_SCRIPT, 2, buyerKey(buyer), refundKey(order), order, SERVER_LIMITS.refundMemorySeconds]);
  return typeof result === 'number' ? result : 0;
}

/**
 * Checks both sources in parallel (one round trip of latency) and says which
 * one grants access, or null when neither does.
 */
export async function findAccessSource(email: string): Promise<AccessSource | null> {
  const buyer = parseEmail(email);
  if (!buyer) return null;
  const landing = env.paywall.landingGrants;
  const [grant, listed] = await Promise.all([
    landing ? upstashCommand(['GET', landingGrantKey(buyer, landing)]) : Promise.resolve(null),
    upstashCommand(['EXISTS', buyerKey(buyer)]),
  ]);
  if (isActiveLandingGrant(grant)) return 'landing-page';
  if (listed === 1) return 'buyer-list';
  return null;
}

export async function isEmailAuthorized(email: string): Promise<boolean> {
  return (await findAccessSource(email)) !== null;
}

/* Revocation check for the AI routes, cached so a recipe does not cost a Redis round trip each time. */

const accessCache = new Map<string, { authorized: boolean; until: number }>();
let lastOutageLog = 0;

/**
 * Cached `isEmailAuthorized`. During an Upstash outage it trusts the signed
 * access token (paying users keep cooking) and logs at most once a minute.
 */
export async function isEmailStillAuthorized(email: string, now = Date.now()): Promise<boolean> {
  const cached = accessCache.get(email);
  if (cached && cached.until > now) return cached.authorized;

  try {
    const authorized = await isEmailAuthorized(email);
    accessCache.delete(email);
    accessCache.set(email, {
      authorized,
      until: now + (authorized ? SERVER_LIMITS.accessCacheMs : SERVER_LIMITS.accessNegativeCacheMs),
    });
    if (accessCache.size > SERVER_LIMITS.accessCacheMaxEntries) {
      const oldest = accessCache.keys().next().value;
      if (oldest !== undefined) accessCache.delete(oldest);
    }
    return authorized;
  } catch (error) {
    if (!(error instanceof UpstashError)) throw error;
    if (now - lastOutageLog > 60_000) {
      lastOutageLog = now;
      console.warn(`[paywall] Revocation check skipped (${error.message}); trusting signed access tokens meanwhile.`);
    }
    return true;
  }
}

/**
 * Drops the cached answer, so a refund handled by this process takes effect
 * immediately. A refund handled by the landing page reaches the AI routes when
 * the cached answer expires (SERVER_LIMITS.accessCacheMs).
 */
export function forgetCachedAccess(email: string): void {
  accessCache.delete(email);
}
