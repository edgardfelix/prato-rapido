import type { ApiErrorBody, ApiErrorCode } from '@/@types';

export type ClientErrorCode = ApiErrorCode | 'NETWORK' | 'TIMEOUT' | 'ABORTED';

/** Normalized error thrown by the HTTP client. `message` is always pt-BR and UI-safe. */
export class ApiClientError extends Error {
  readonly status: number;
  readonly code: ClientErrorCode;
  readonly retryAfterSeconds?: number;

  constructor(status: number, code: ClientErrorCode, message: string, retryAfterSeconds?: number) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
const DEFAULT_TIMEOUT_MS = 60_000;

/** Turns API-relative URLs (e.g. the proxied food photo) into absolute ones when the API lives elsewhere. */
export const resolveApiUrl = (url: string): string => (url.startsWith('/') ? `${API_BASE_URL}${url}` : url);

const MESSAGES = {
  network: 'Sem conexão com o servidor. Verifique sua internet e tente novamente.',
  timeout: 'O servidor demorou demais para responder. Tente novamente.',
  aborted: 'A requisição foi cancelada.',
  unavailable: import.meta.env.DEV
    ? 'A API não está respondendo. Confira se o servidor está rodando (npm run dev).'
    : 'O serviço está indisponível no momento. Tente novamente em instantes.',
  tooLarge: 'O arquivo enviado é grande demais. Tente uma foto ou um áudio menor.',
  invalid: 'O servidor enviou uma resposta inesperada. Tente novamente.',
} as const;

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== 'object' || value === null || !('error' in value)) return false;
  const { error } = value as { error: unknown };
  return (
    typeof error === 'object' &&
    error !== null &&
    typeof (error as { code?: unknown }).code === 'string' &&
    typeof (error as { message?: unknown }).message === 'string'
  );
}

function errorFromResponse(status: number, data: unknown): ApiClientError {
  if (isApiErrorBody(data)) {
    return new ApiClientError(status, data.error.code, data.error.message, data.error.retryAfterSeconds);
  }
  if (status === 413) return new ApiClientError(status, 'PAYLOAD_TOO_LARGE', MESSAGES.tooLarge);
  return new ApiClientError(status, 'AI_UNAVAILABLE', MESSAGES.unavailable);
}

interface RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  /**
   * AI routes: sends the buyer access token and the human-verification token.
   * If the server asks for a new human check (CHALLENGE_REQUIRED) it is shown
   * and the request is retried once; if it refuses the access (ACCESS_REQUIRED)
   * the activation screen comes back.
   */
  humanCheck?: boolean;
}

/** Bridge to the "Verificação rápida" UI, registered by HumanCheckProvider (keeps this module React-free). */
export interface HumanCheckBridge {
  getToken: () => string | null;
  /** Shows the challenge; resolves true once it is solved, false if the user closes it. */
  requestVerification: () => Promise<boolean>;
}

/** Bridge to the paid-access state, registered by AccessProvider. */
export interface AccessBridge {
  getToken: () => string | null;
  /** The server refused this device's access (refund, expiry): lock the app again. */
  onAccessLost: (message: string) => void;
}

let humanCheckBridge: HumanCheckBridge | null = null;
let accessBridge: AccessBridge | null = null;

export function registerHumanCheck(bridge: HumanCheckBridge | null): void {
  humanCheckBridge = bridge;
}

export function registerAccess(bridge: AccessBridge | null): void {
  accessBridge = bridge;
}

export const HUMAN_TOKEN_HEADER = 'X-Human-Token';
export const ACCESS_TOKEN_HEADER = 'X-Access-Token';

/** POSTs JSON with timeout + cancellation and returns the parsed JSON body. */
export async function postJson<TResponse>(path: string, body: unknown, options: RequestOptions = {}): Promise<TResponse> {
  try {
    return await requestJson<TResponse>('POST', path, body, options);
  } catch (error) {
    if (options.humanCheck && error instanceof ApiClientError && error.code === 'ACCESS_REQUIRED') {
      accessBridge?.onAccessLost(error.message);
      throw error;
    }
    const bridge = humanCheckBridge;
    const needsCheck = error instanceof ApiClientError && error.code === 'CHALLENGE_REQUIRED';
    if (!options.humanCheck || !needsCheck || !bridge || options.signal?.aborted) throw error;
    const solved = await bridge.requestVerification();
    if (!solved || options.signal?.aborted) throw error;
    return requestJson<TResponse>('POST', path, body, options);
  }
}

/** GETs JSON with timeout + cancellation. */
export function getJson<TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> {
  return requestJson<TResponse>('GET', path, undefined, options);
}

async function requestJson<TResponse>(
  method: 'GET' | 'POST',
  path: string,
  body: unknown,
  { signal, timeoutMs = DEFAULT_TIMEOUT_MS, humanCheck = false }: RequestOptions,
): Promise<TResponse> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const forwardAbort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  else signal?.addEventListener('abort', forwardAbort, { once: true });

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (method === 'POST') headers['Content-Type'] = 'application/json';
  if (humanCheck) {
    const accessToken = accessBridge?.getToken();
    if (accessToken) headers[ACCESS_TOKEN_HEADER] = accessToken;
    const humanToken = humanCheckBridge?.getToken();
    if (humanToken) headers[HUMAN_TOKEN_HEADER] = humanToken;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: method === 'POST' ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const data: unknown = await response.json().catch(() => undefined);

    if (!response.ok) throw errorFromResponse(response.status, data);
    if (data === undefined || data === null) throw new ApiClientError(response.status, 'INTERNAL', MESSAGES.invalid);
    return data as TResponse;
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    if (timedOut) throw new ApiClientError(0, 'TIMEOUT', MESSAGES.timeout);
    if (controller.signal.aborted) throw new ApiClientError(0, 'ABORTED', MESSAGES.aborted);
    throw new ApiClientError(0, 'NETWORK', MESSAGES.network);
  } finally {
    window.clearTimeout(timer);
    signal?.removeEventListener('abort', forwardAbort);
  }
}

/** Extracts a UI-safe message from anything thrown. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) return error.message;
  return 'Algo deu errado. Tente novamente em instantes.';
}
