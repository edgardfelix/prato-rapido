import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

/*
 * Password hashing with scrypt (built into Node.js, no dependency), using one
 * of the OWASP Password Storage settings: N=2^15, r=8, p=3 (32 MiB per hash,
 * gentle on serverless memory). Stored as "scrypt$N$r$p$<salt>$<hash>"
 * (base64url), so the cost can change later without breaking existing
 * passwords. The password itself is never stored.
 */

const KEY_LENGTH = 32;
const SALT_BYTES = 16;
const COST = Object.freeze({ N: 2 ** 15, r: 8, p: 3 });
/** Bounds for parameters read back from Redis: a tampered value cannot exhaust memory. */
const MAX_N = 2 ** 17;
const MAX_R = 16;
const MAX_P = 4;

interface ScryptCost {
  N: number;
  r: number;
  p: number;
}

function derive(password: string, salt: Buffer, cost: ScryptCost): Promise<Buffer> {
  // NFKC: the same password typed on different keyboards/devices gives the same bytes.
  const normalized = password.normalize('NFKC');
  return new Promise((resolve, reject) => {
    scrypt(normalized, salt, KEY_LENGTH, { ...cost, maxmem: 256 * cost.N * cost.r }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const hash = await derive(password, salt, COST);
  return ['scrypt', COST.N, COST.r, COST.p, salt.toString('base64url'), hash.toString('base64url')].join('$');
}

/** Constant-time check of `password` against a stored hash. False for any malformed hash. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [N, r, p] = parts.slice(1, 4).map(Number);
  const validCost =
    Number.isInteger(N) && Number.isInteger(r) && Number.isInteger(p) &&
    N >= 2 && N <= MAX_N && (N & (N - 1)) === 0 && r >= 1 && r <= MAX_R && p >= 1 && p <= MAX_P;
  if (!validCost) return false;

  const salt = Buffer.from(parts[4] ?? '', 'base64url');
  const expected = Buffer.from(parts[5] ?? '', 'base64url');
  if (salt.length < SALT_BYTES || expected.length !== KEY_LENGTH) return false;

  const actual = await derive(password, salt, { N, r, p });
  return timingSafeEqual(actual, expected);
}

/**
 * Short fingerprint of a stored hash, carried by the session token. Any new
 * password (or a reset by support) changes it, which ends every older session.
 */
export function passwordFingerprint(storedHash: string): string {
  return createHash('sha256').update(storedHash).digest('base64url').slice(0, 16);
}
