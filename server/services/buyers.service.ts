import { SERVER_LIMITS } from '../config/limits.ts';
import { parseEmail } from '../validation/email.ts';
import { upstashCommand, UpstashError } from './upstash.service.ts';

/*
 * Buyer list in Upstash Redis (no SQL, no Supabase).
 *
 * `buyer:<email>` is a SET of the order ids that grant access: EXISTS means
 * "authorized", and Redis drops a set when its last member goes, so refunding
 * one of two orders keeps the access paid by the other.
 * `refund:<orderId>` remembers refunded orders for a while, so a late retry
 * of purchase_approved can never bring a refunded order back.
 * Both writes are Lua scripts (EVAL), so each one is atomic.
 */

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

export async function isEmailAuthorized(email: string): Promise<boolean> {
  const buyer = parseEmail(email);
  if (!buyer) return false;
  return (await upstashCommand(['EXISTS', buyerKey(buyer)])) === 1;
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

/** Drops the cached answer, so a refund handled by this process takes effect immediately. */
export function forgetCachedAccess(email: string): void {
  accessCache.delete(email);
}
