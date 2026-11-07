import { env } from '../config/env.ts';
import { SERVER_LIMITS } from '../config/limits.ts';
import { signToken, verifyToken } from '../utils/signing.ts';
import { parseEmail } from '../validation/email.ts';

/*
 * Access tokens prove that this device entered a buyer's e-mail. They are
 * stateless (HMAC-signed, like the human-check tokens) and carry the buyer
 * e-mail, so the AI routes can also check that the purchase was not refunded.
 */

const ACCESS_PURPOSE = 'buyer-access';
const DAY_MS = 24 * 60 * 60_000;

export function issueAccessToken(email: string, now = Date.now()): { token: string; expiresAt: string } {
  const expiresAt = now + env.paywall.tokenTtlDays * DAY_MS;
  return {
    token: signToken({ v: 1, sub: email, exp: expiresAt }, ACCESS_PURPOSE),
    expiresAt: new Date(expiresAt).toISOString(),
  };
}

/** The buyer e-mail of a valid, unexpired access token, or null. */
export function readAccessToken(token: unknown, now = Date.now()): string | null {
  const claims = verifyToken(token, ACCESS_PURPOSE, SERVER_LIMITS.accessTokenMaxChars);
  if (!claims || claims.v !== 1 || typeof claims.exp !== 'number' || claims.exp <= now) return null;
  return parseEmail(claims.sub);
}
