import { SERVER_LIMITS } from '../config/limits.ts';
import { upstashCommand } from './upstash.service.ts';

/*
 * First-access passwords in Upstash Redis (e-mails arrive normalized):
 *
 *   pratorapido:pass:<email>       scrypt hash (password.service.ts), no expiry
 *   pratorapido:pass-fail:<email>  wrong-password counter; the first failure
 *                                  starts a window of loginLockSeconds
 */

const passwordKey = (email: string) => `pratorapido:pass:${email}`;
const failureKey = (email: string) => `pratorapido:pass-fail:${email}`;

/** INCR, plus EXPIRE on the first failure of a window, atomically. */
export const FAILURE_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return count`;

export async function hasPassword(email: string): Promise<boolean> {
  return (await upstashCommand(['EXISTS', passwordKey(email)])) === 1;
}

export async function readPasswordHash(email: string): Promise<string | null> {
  const value = await upstashCommand(['GET', passwordKey(email)]);
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/** Saves the FIRST password only (SET NX): false when the e-mail already has one, so nobody can overwrite it. */
export async function savePasswordIfAbsent(email: string, hash: string): Promise<boolean> {
  return (await upstashCommand(['SET', passwordKey(email), hash, 'NX'])) === 'OK';
}

export interface LoginState {
  hash: string | null;
  /** Wrong passwords in the current window. */
  failures: number;
  /** Seconds until the window (and a lock) ends. */
  lockSeconds: number;
}

/** Stored hash and wrong-password counter, in parallel (one round trip of latency). */
export async function readLoginState(email: string): Promise<LoginState> {
  const [hash, failures, ttl] = await Promise.all([
    readPasswordHash(email),
    upstashCommand(['GET', failureKey(email)]),
    upstashCommand(['TTL', failureKey(email)]),
  ]);
  return {
    hash,
    failures: Number(failures) || 0,
    lockSeconds: typeof ttl === 'number' && ttl > 0 ? ttl : SERVER_LIMITS.loginLockSeconds,
  };
}

/** Counts a wrong password and returns the count in the current window. */
export async function recordLoginFailure(email: string): Promise<number> {
  const count = await upstashCommand(['EVAL', FAILURE_SCRIPT, 1, failureKey(email), SERVER_LIMITS.loginLockSeconds]);
  return typeof count === 'number' ? count : SERVER_LIMITS.loginMaxFailures;
}

export async function clearLoginFailures(email: string): Promise<void> {
  await upstashCommand(['DEL', failureKey(email)]);
}

/** Support: removes the password and the lock, so the next access creates a new password. */
export async function removePassword(email: string): Promise<boolean> {
  const removed = await upstashCommand(['DEL', passwordKey(email), failureKey(email)]);
  return typeof removed === 'number' && removed > 0;
}
