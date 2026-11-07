import type { AccessStatusResponse, VerifyEmailPayload, VerifyEmailResponse } from '@/@types';
import { getJson, postJson } from './httpClient';

/** Paid access: is the paywall on, and is this e-mail a buyer? */
export const accessService = {
  getStatus(signal?: AbortSignal): Promise<AccessStatusResponse> {
    return getJson<AccessStatusResponse>('/api/access/status', { signal, timeoutMs: 10_000 });
  },

  verifyEmail(payload: VerifyEmailPayload, signal?: AbortSignal): Promise<VerifyEmailResponse> {
    return postJson<VerifyEmailResponse>('/api/verify-email', payload, { signal, timeoutMs: 15_000 });
  },
};
