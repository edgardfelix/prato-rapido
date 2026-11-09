import type { AccessStatusResponse, CredentialsPayload, SessionResponse, VerifyEmailPayload, VerifyEmailResponse } from '@/@types';
import { getJson, postJson } from './httpClient';

/**
 * Paid access: paywall status, purchase check, first-access password and the
 * session. The session is an HttpOnly cookie set by the server: these calls
 * never see it, the browser sends it with every same-origin request.
 */
export const accessService = {
  getStatus(signal?: AbortSignal): Promise<AccessStatusResponse> {
    return getJson<AccessStatusResponse>('/api/access/status', { signal, timeoutMs: 10_000 });
  },

  /** Purchase? Then first access (create a password) or not. Throws NO_PURCHASE (403) otherwise. */
  verifyEmail(payload: VerifyEmailPayload, signal?: AbortSignal): Promise<VerifyEmailResponse> {
    return postJson<VerifyEmailResponse>('/api/verify-email', payload, { signal, timeoutMs: 15_000 });
  },

  setupPassword(payload: CredentialsPayload, signal?: AbortSignal): Promise<SessionResponse> {
    return postJson<SessionResponse>('/api/auth/setup-password', payload, { signal, timeoutMs: 20_000 });
  },

  login(payload: CredentialsPayload, signal?: AbortSignal): Promise<SessionResponse> {
    return postJson<SessionResponse>('/api/auth/login', payload, { signal, timeoutMs: 20_000 });
  },

  /** Is this device still signed in? (401 when not.) Extends the session near its end. */
  getSession(signal?: AbortSignal): Promise<SessionResponse> {
    return getJson<SessionResponse>('/api/auth/session', { signal, timeoutMs: 10_000 });
  },

  logout(): Promise<unknown> {
    return postJson<unknown>('/api/auth/logout', {}, { timeoutMs: 10_000 });
  },
};
