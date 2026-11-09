import type { CookieOptions, Request, Response } from 'express';
import { env } from '../config/env.ts';
import { SERVER_LIMITS } from '../config/limits.ts';
import { signToken, verifyToken } from '../utils/signing.ts';
import { parseEmail } from '../validation/email.ts';
import { findAccessSource } from './buyers.service.ts';
import { readPasswordHash } from './credentials.service.ts';
import { passwordFingerprint } from './password.service.ts';
import { UpstashError } from './upstash.service.ts';

/*
 * Buyer sessions. After the password check the server sets an HttpOnly cookie
 * holding a signed token { sub: e-mail, exp, pw: password fingerprint }:
 * page scripts cannot read it (an XSS cannot steal it), SameSite=Strict keeps
 * other sites from sending it, and the AI routes re-check (cached) that the
 * purchase is still active and the password unchanged. Tokens from the old
 * e-mail-only activation used another purpose ('buyer-access') and are no
 * longer accepted anywhere.
 */

export const SESSION_COOKIE = 'pr_session';
const SESSION_PURPOSE = 'buyer-session';
const DAY_MS = 24 * 60 * 60_000;

export interface Session {
  email: string;
  /** Epoch ms. */
  expiresAt: number;
  /** passwordFingerprint() of the password used to sign in. */
  fingerprint: string;
}

export function issueSessionToken(email: string, fingerprint: string, now = Date.now()): { token: string; expiresAt: number } {
  const expiresAt = now + env.paywall.tokenTtlDays * DAY_MS;
  return { token: signToken({ v: 2, sub: email, exp: expiresAt, pw: fingerprint }, SESSION_PURPOSE), expiresAt };
}

export function readSessionToken(token: unknown, now = Date.now()): Session | null {
  const claims = verifyToken(token, SESSION_PURPOSE, SERVER_LIMITS.accessTokenMaxChars);
  if (!claims || claims.v !== 2 || typeof claims.exp !== 'number' || claims.exp <= now || typeof claims.pw !== 'string') return null;
  const email = parseEmail(claims.sub);
  return email ? { email, expiresAt: claims.exp, fingerprint: claims.pw } : null;
}

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator > 0 && part.slice(0, separator).trim() === name) return part.slice(separator + 1).trim();
  }
  return undefined;
}

/** The valid, unexpired session of this request (cookie), or null. Does not check Redis. */
export function readSession(req: Request): Session | null {
  return readSessionToken(readCookie(req, SESSION_COOKIE));
}

/** Only the API reads the cookie; Secure whenever the request came over HTTPS (Vercel: always). */
const cookieOptions = (req: Request): CookieOptions => ({ httpOnly: true, secure: req.secure, sameSite: 'strict', path: '/api' });

/** Starts (or extends) a session and returns its expiry (ISO), which the client may show. */
export function startSession(req: Request, res: Response, email: string, fingerprint: string): string {
  const { token, expiresAt } = issueSessionToken(email, fingerprint);
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions(req), maxAge: expiresAt - Date.now() });
  return new Date(expiresAt).toISOString();
}

export function endSession(req: Request, res: Response): void {
  res.clearCookie(SESSION_COOKIE, cookieOptions(req));
}

/* Validity check, cached so a recipe does not cost Redis round trips each time. */

const accountCache = new Map<string, { active: boolean; fingerprint: string | null; until: number }>();
let lastOutageLog = 0;

/**
 * The purchase is still active (landing page grant or buyer list) and the
 * password is the one this session signed in with. During an Upstash outage
 * the signed cookie is trusted (paying users keep cooking), logged at most
 * once a minute.
 */
export async function isSessionStillValid(session: Session, now = Date.now()): Promise<boolean> {
  const cached = accountCache.get(session.email);
  if (cached && cached.until > now) return cached.active && cached.fingerprint === session.fingerprint;

  try {
    const [source, hash] = await Promise.all([findAccessSource(session.email), readPasswordHash(session.email)]);
    const state = { active: source !== null, fingerprint: hash ? passwordFingerprint(hash) : null };
    accountCache.delete(session.email);
    accountCache.set(session.email, {
      ...state,
      until: now + (state.active ? SERVER_LIMITS.accessCacheMs : SERVER_LIMITS.accessNegativeCacheMs),
    });
    if (accountCache.size > SERVER_LIMITS.accessCacheMaxEntries) {
      const oldest = accountCache.keys().next().value;
      if (oldest !== undefined) accountCache.delete(oldest);
    }
    return state.active && state.fingerprint === session.fingerprint;
  } catch (error) {
    if (!(error instanceof UpstashError)) throw error;
    if (now - lastOutageLog > 60_000) {
      lastOutageLog = now;
      console.warn(`[paywall] Session check skipped (${error.message}); trusting signed sessions meanwhile.`);
    }
    return true;
  }
}

/**
 * Drops the cached answer for an e-mail, so a refund, a new password or a
 * reset handled by this process takes effect at once. Changes made elsewhere
 * (landing page, another instance) apply when the cache expires.
 */
export function forgetCachedAccess(email: string): void {
  accountCache.delete(email);
}
