import type { ApiErrorCode } from '../../src/@types/api.ts';

interface HttpErrorOptions {
  retryAfterSeconds?: number;
  cause?: unknown;
}

/** An error that maps 1:1 to an API error response. `message` is pt-BR and safe for end users. */
export class HttpError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly retryAfterSeconds?: number;

  constructor(status: number, code: ApiErrorCode, message: string, options: HttpErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

export const badRequest = (message: string) => new HttpError(400, 'BAD_REQUEST', message);
