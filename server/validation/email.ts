import { SERVER_LIMITS } from '../config/limits.ts';

/** Printable ASCII only ('!' to '~'): no spaces, control or invisible characters. */
const PRINTABLE_ASCII = /^[!-~]+$/;
const EMAIL_SHAPE = /^[^@<>()[\]\\,;:"]+@[^@<>()[\]\\,;:"]+\.[^@<>()[\]\\,;:".]{2,}$/;

/** Buyer keys use this form, so "Ana@Mail.com " and "ana@mail.com" are the same buyer. */
export const normalizeEmail = (value: string): string => value.trim().toLowerCase();

/** A normalized, plausible e-mail address, or null. */
export function parseEmail(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > SERVER_LIMITS.emailMaxChars + 32) return null;
  const email = normalizeEmail(value);
  if (email.length > SERVER_LIMITS.emailMaxChars || !PRINTABLE_ASCII.test(email)) return null;
  return EMAIL_SHAPE.test(email) ? email : null;
}

/** "jo***@example.com": enough to recognize a buyer in the logs without exposing the address. */
export function maskEmail(email: string): string {
  const at = email.lastIndexOf('@');
  return at > 0 ? `${email.slice(0, Math.min(2, at))}***${email.slice(at)}` : '***';
}
