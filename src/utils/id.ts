/**
 * Creates a unique id. `crypto.randomUUID` only exists in secure contexts,
 * so a fallback keeps the app working when opened over plain HTTP on a LAN.
 */
export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
