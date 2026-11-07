/* Same rules as the server (server/validation/email.ts), so the screen rejects what the API would. */

export const EMAIL_MAX_LENGTH = 254;

/** Printable ASCII only ('!' to '~'): no spaces, control or invisible characters. */
const PRINTABLE_ASCII = /^[!-~]+$/;
const EMAIL_SHAPE = /^[^@<>()[\]\\,;:"]+@[^@<>()[\]\\,;:"]+\.[^@<>()[\]\\,;:".]{2,}$/;

/** "Ana@Mail.com " → "ana@mail.com" (buyers are stored in this form). */
export const normalizeEmail = (value: string): string => value.trim().toLowerCase();

export const isValidEmail = (value: string): boolean =>
  value.length <= EMAIL_MAX_LENGTH && PRINTABLE_ASCII.test(value) && EMAIL_SHAPE.test(value);

/** "jo***@example.com" */
export function maskEmail(email: string): string {
  const at = email.lastIndexOf('@');
  return at > 0 ? `${email.slice(0, Math.min(2, at))}***${email.slice(at)}` : '***';
}
