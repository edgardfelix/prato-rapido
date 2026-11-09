import type { Request, Response } from 'express';
import type { AccessStatusResponse, SessionResponse, VerifyEmailResponse } from '../../src/@types/access.ts';
import { env } from '../config/env.ts';
import { SERVER_LIMITS } from '../config/limits.ts';
import { findAccessSource, type AccessSource } from '../services/buyers.service.ts';
import {
  clearLoginFailures,
  hasPassword,
  readLoginState,
  recordLoginFailure,
  savePasswordIfAbsent,
} from '../services/credentials.service.ts';
import { hashPassword, passwordFingerprint, verifyPassword } from '../services/password.service.ts';
import { endSession, forgetCachedAccess, isSessionStillValid, readSession, startSession } from '../services/session.service.ts';
import { UpstashError } from '../services/upstash.service.ts';
import { HttpError } from '../utils/httpError.ts';
import { maskEmail } from '../validation/email.ts';
import { validateCredentialsPayload, validateVerifyEmailPayload } from '../validation/payload.validator.ts';

/*
 * Sign-in with a first-access password (no e-mail is sent):
 *   1. POST /api/verify-email      purchase? → { isFirstAccess }   (no purchase → 403)
 *   2. POST /api/auth/setup-password   first access: creates the password, once
 *      POST /api/auth/login            later: checks it (5 misses → 15 min lock)
 *   Both set the HttpOnly session cookie; GET /api/auth/session checks it.
 */

export const BUYER_NOT_FOUND_MESSAGE = 'E-mail não encontrado na base de compradores.';
const SOURCE_LABEL: Record<AccessSource, string> = { 'landing-page': 'landing page grant', 'buyer-list': 'buyer list' };

function requirePaywall(): void {
  if (!env.paywall.enabled) throw new HttpError(503, 'NOT_CONFIGURED', 'O acesso pago não está ativo neste servidor.');
}

/** Redis failures become a friendly 503: the app asks to try again. */
async function withUpstash<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (!(error instanceof UpstashError)) throw error;
    throw new HttpError(503, 'ACCESS_UNAVAILABLE', 'Não foi possível conferir seu acesso agora. Tente de novo em instantes.', {
      cause: error,
    });
  }
}

const noPurchase = () => new HttpError(403, 'NO_PURCHASE', BUYER_NOT_FOUND_MESSAGE);

function lockedOut(seconds: number): HttpError {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return new HttpError(429, 'RATE_LIMITED', `Muitas tentativas com senha errada. Tente de novo em ${minutes} min.`, {
    retryAfterSeconds: seconds,
  });
}

function sendSession(req: Request, res: Response, email: string, passwordHash: string): void {
  const expiresAt = startSession(req, res, email, passwordFingerprint(passwordHash));
  const body: SessionResponse = { email, expiresAt };
  res.status(200).json(body);
}

/** `GET /api/access/status`: tells the app whether to show the activation screen. */
export function accessStatusHandler(_req: Request, res: Response): void {
  const { enabled, checkoutUrl, priceLabel } = env.paywall;
  const body: AccessStatusResponse = { enabled, checkoutUrl, priceLabel };
  res.status(200).json(body);
}

/** `POST /api/verify-email`: step 1. It never grants access by itself. */
export async function verifyEmailHandler(req: Request, res: Response): Promise<void> {
  requirePaywall();
  const { email } = validateVerifyEmailPayload(req.body);
  const [source, passwordSet] = await withUpstash(() => Promise.all([findAccessSource(email), hasPassword(email)]));
  if (!source) throw noPurchase();
  const body: VerifyEmailResponse = { isFirstAccess: !passwordSet };
  res.status(200).json(body);
}

/** `POST /api/auth/setup-password`: first access only. The password is saved once (SET NX), never overwritten. */
export async function setupPasswordHandler(req: Request, res: Response): Promise<void> {
  requirePaywall();
  const { email, password } = validateCredentialsPayload(req.body, 'new-password');
  const source = await withUpstash(() => findAccessSource(email));
  if (!source) throw noPurchase();

  const passwordHash = await hashPassword(password);
  if (!(await withUpstash(() => savePasswordIfAbsent(email, passwordHash)))) {
    throw new HttpError(409, 'PASSWORD_ALREADY_SET', 'Este e-mail já tem senha. Entre com ela.');
  }
  forgetCachedAccess(email);
  console.log(`[auth] Password created for ${maskEmail(email)} (${SOURCE_LABEL[source]}).`);
  sendSession(req, res, email, passwordHash);
}

/** `POST /api/auth/login`: checks the password; after loginMaxFailures misses the e-mail is locked for a while. */
export async function loginHandler(req: Request, res: Response): Promise<void> {
  requirePaywall();
  const { email, password } = validateCredentialsPayload(req.body, 'login');
  const state = await withUpstash(() => readLoginState(email));
  if (state.failures >= SERVER_LIMITS.loginMaxFailures) throw lockedOut(state.lockSeconds);

  if (!state.hash) {
    const source = await withUpstash(() => findAccessSource(email));
    if (!source) throw noPurchase();
    throw new HttpError(409, 'PASSWORD_NOT_SET', 'Este e-mail ainda não tem senha. Crie a sua para entrar.');
  }

  if (!(await verifyPassword(password, state.hash))) {
    const failures = await withUpstash(() => recordLoginFailure(email));
    console.warn(`[auth] Wrong password for ${maskEmail(email)} (${failures}/${SERVER_LIMITS.loginMaxFailures}).`);
    if (failures >= SERVER_LIMITS.loginMaxFailures) throw lockedOut(SERVER_LIMITS.loginLockSeconds);
    throw new HttpError(401, 'INVALID_PASSWORD', 'Senha incorreta');
  }

  // A refunded purchase is not brought back by a correct password.
  const source = await withUpstash(() => findAccessSource(email));
  if (!source) throw noPurchase();
  if (state.failures > 0) await withUpstash(() => clearLoginFailures(email));
  forgetCachedAccess(email);
  console.log(`[auth] Signed in: ${maskEmail(email)} (${SOURCE_LABEL[source]}).`);
  sendSession(req, res, email, state.hash);
}

/** `GET /api/auth/session`: is this device still signed in? Extends sessions near their end. */
export async function sessionHandler(req: Request, res: Response): Promise<void> {
  requirePaywall();
  const session = readSession(req);
  if (!session) {
    endSession(req, res);
    throw new HttpError(401, 'ACCESS_REQUIRED', 'Entre com seu e-mail e senha para continuar.');
  }
  if (!(await isSessionStillValid(session))) {
    endSession(req, res);
    throw new HttpError(401, 'ACCESS_REQUIRED', 'Sua sessão terminou. Entre de novo com seu e-mail e senha.');
  }

  const expiresAt =
    session.expiresAt - Date.now() < SERVER_LIMITS.sessionRenewBeforeMs
      ? startSession(req, res, session.email, session.fingerprint)
      : new Date(session.expiresAt).toISOString();
  const body: SessionResponse = { email: session.email, expiresAt };
  res.status(200).json(body);
}

/** `POST /api/auth/logout`: ends this device's session (the cookie cannot be removed by page scripts). */
export function logoutHandler(req: Request, res: Response): void {
  endSession(req, res);
  res.status(200).json({ success: true });
}
