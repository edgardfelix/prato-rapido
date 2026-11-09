import { SERVER_LIMITS } from '../config/limits.ts';

/*
 * Password policy for the first-access password (NIST SP 800-63B style):
 * length matters more than composition rules, so it asks for 8+ characters
 * and refuses only passwords that are trivial to guess.
 */

const COMMON_PASSWORDS = new Set([
  '12345678', '123456789', '1234567890', '12341234', '11111111', '00000000', '87654321', '123123123',
  'password', 'password1', 'senha123', 'senha1234', 'senhasenha', 'minhasenha', 'mudar123', 'trocar123',
  'qwerty123', 'qwertyui', 'abcdefgh', 'abc12345', 'iloveyou', 'admin123', 'pratorapido', 'prato123',
  'pratorapido123', 'cakto123',
]);

/** Tabs, line breaks and other control characters cannot be typed reliably on every device. */
function hasControlCharacters(value: string): boolean {
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}

/** Why `password` cannot be used as a new password for `email`, or null when it is fine. */
export function newPasswordProblem(password: string, email: string): string | null {
  if (password.length < SERVER_LIMITS.passwordMinChars) return `Use pelo menos ${SERVER_LIMITS.passwordMinChars} caracteres.`;
  if (password.length > SERVER_LIMITS.passwordMaxChars) return `Use no máximo ${SERVER_LIMITS.passwordMaxChars} caracteres.`;
  if (hasControlCharacters(password)) return 'A senha tem caracteres inválidos.';

  const lower = password.normalize('NFKC').toLowerCase();
  if (COMMON_PASSWORDS.has(lower) || /^(.)\1+$/u.test(lower)) return 'Essa senha é fácil demais de adivinhar. Escolha outra.';
  const localPart = email.slice(0, email.lastIndexOf('@'));
  if (lower === email || lower === localPart) return 'Não use o seu e-mail como senha.';
  return null;
}
