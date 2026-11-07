/** Response of `GET /api/access/status` (public). */
export interface AccessStatusResponse {
  /** The paywall is on: the AI routes require an access token. */
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
 * Response of `POST /api/verify-email`. A found buyer gets a signed access
 * token, sent in the `X-Access-Token` header of AI requests.
 */
export type VerifyEmailResponse =
  | { success: true; accessToken: string; expiresAt: string }
  | { success: false; message: string };

/** What this device keeps after a successful activation. */
export interface AccessGrant {
  /** Purchase e-mail (normalized), used to show which account unlocked the device. */
  email: string;
  token: string;
  expiresAt: string;
}
