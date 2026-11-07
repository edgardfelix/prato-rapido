import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.ts';

/*
 * One server secret (IMAGE_SIGNING_SECRET, or derived from the Gemini key)
 * signs everything the server hands out, with a separate derived key per
 * purpose so a token minted for one use can never be replayed as another.
 *
 * - Image URLs are signed so /api/recipe-image only renders prompts created
 *   by this server (it cannot be abused as an open image-generation proxy).
 * - Challenge and human-verification tokens are stateless: no database needed.
 */

export function sign(payload: string): string {
  return createHmac('sha256', env.imageSigningSecret).update(payload).digest('base64url').slice(0, 32);
}

export function verifySignature(payload: string, signature: string): boolean {
  return safeEqual(sign(payload), signature);
}

/** Constant-time string comparison (false for different lengths). */
export function safeEqual(expected: string, received: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

const purposeKeys = new Map<string, Buffer>();

function keyFor(purpose: string): Buffer {
  let key = purposeKeys.get(purpose);
  if (!key) {
    key = createHmac('sha256', env.imageSigningSecret).update(`prato-rapido:key:${purpose}`).digest();
    purposeKeys.set(purpose, key);
  }
  return key;
}

/** HMAC-SHA256 (base64url) of `data` under the key derived for `purpose`. */
export function hmac(purpose: string, data: string): string {
  return createHmac('sha256', keyFor(purpose)).update(data).digest('base64url');
}

/**
 * Compact signed token: base64url(JSON) + "." + HMAC. It is signed, not
 * encrypted: anyone can read the payload, so never put a secret in it.
 */
export function signToken(payload: object, purpose: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${hmac(purpose, body)}`;
}

/** Returns the payload when the signature matches, otherwise null. Never throws. */
export function verifyToken(token: unknown, purpose: string, maxChars: number): Record<string, unknown> | null {
  if (typeof token !== 'string' || token.length === 0 || token.length > maxChars) return null;
  const separator = token.indexOf('.');
  if (separator <= 0 || separator !== token.lastIndexOf('.')) return null;

  const body = token.slice(0, separator);
  if (!safeEqual(hmac(purpose, body), token.slice(separator + 1))) return null;

  try {
    const payload: unknown = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return typeof payload === 'object' && payload !== null && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
