/** localStorage keys. Namespaced to avoid clashes with other apps on the same origin. */
export const STORAGE_KEYS = {
  theme: 'prato-rapido:theme',
  user: 'prato-rapido:user',
  history: 'prato-rapido:history',
  journey: 'prato-rapido:journey',
  settings: 'prato-rapido:settings',
  verification: 'prato-rapido:verification',
  /** Signed buyer access token + purchase e-mail (paywall). */
  access: 'prato-rapido:access',
  /** Last known paywall status from the server (renders instantly, revalidated in the background). */
  paywall: 'prato-rapido:paywall',
} as const;

/** Device flag required by the activation screen spec: "true" once the purchase e-mail was verified. */
export const ACCESS_FLAG_KEY = 'prato_rapido_access';

/** Every key of this app starts with this prefix (used by "Apagar dados da conta"). */
export const STORAGE_PREFIX = 'prato-rapido:';
