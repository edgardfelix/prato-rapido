/** Response of `GET /api/access/status` (public). */
export interface AccessStatusResponse {
  /** The paywall is on: the AI routes require a buyer session. */
  enabled: boolean;
  /** Cakto checkout for the "Comprar Acesso" button (null when not configured). */
  checkoutUrl: string | null;
  /** Price shown on the button, e.g. "R$ 21,90". */
  priceLabel: string;
}

/** Body of `POST /api/verify-email`. */
export interface VerifyEmailPayload {
  email: string;
}

/**
 * Response of `POST /api/verify-email` for an e-mail with a purchase (without
 * one the API answers 403 NO_PURCHASE). It never grants access by itself: the
 * next step creates the password (first access) or asks for it.
 */
export interface VerifyEmailResponse {
  isFirstAccess: boolean;
}

/** Body of `POST /api/auth/setup-password` and `POST /api/auth/login`. */
export interface CredentialsPayload {
  email: string;
  password: string;
}

/**
 * Response of setup-password, login and `GET /api/auth/session`. The session
 * itself lives in an HttpOnly cookie that page scripts cannot read.
 */
export interface SessionResponse {
  email: string;
  /** ISO date when the session ends (extended while the app is used). */
  expiresAt: string;
}

/** What this device keeps after signing in (no secret: the session is the cookie). */
export interface AccessGrant {
  /** 2 = password sessions. Older e-mail-only activations are discarded. */
  v: 2;
  /** Purchase e-mail (normalized), shown in the profile. */
  email: string;
  expiresAt: string;
}
