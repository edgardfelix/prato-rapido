import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { ApiErrorBody } from '../../src/@types/api.ts';
import { HttpError } from '../utils/httpError.ts';

interface BodyParserError {
  type: string;
  status?: number;
}

const isBodyParserError = (error: unknown): error is BodyParserError =>
  typeof error === 'object' && error !== null && typeof (error as { type?: unknown }).type === 'string';

function normalizeError(error: unknown): HttpError {
  if (error instanceof HttpError) return error;
  if (isBodyParserError(error)) {
    if (error.type === 'entity.too.large') {
      return new HttpError(413, 'PAYLOAD_TOO_LARGE', 'O arquivo enviado é grande demais. Tente uma foto ou um áudio menor.');
    }
    if (error.type === 'entity.parse.failed') return new HttpError(400, 'BAD_REQUEST', 'O corpo da requisição não é um JSON válido.');
    if (error.type === 'charset.unsupported' || error.type === 'encoding.unsupported') {
      return new HttpError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Envie o JSON em UTF-8, sem compressão.');
    }
    return new HttpError(400, 'BAD_REQUEST', 'Requisição inválida.');
  }
  return new HttpError(500, 'INTERNAL', 'Erro inesperado no servidor. Tente novamente.', { cause: error });
}

/** Unknown /api routes. */
export const apiNotFound: RequestHandler = (_req, _res, next) => {
  next(new HttpError(404, 'NOT_FOUND', 'Rota da API não encontrada.'));
};

/** Single exit point for errors: consistent JSON envelope, internals logged but never leaked. */
export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  const httpError = normalizeError(error);

  if (httpError.status >= 500) {
    console.error(`[api] ${req.method} ${req.originalUrl} failed: ${httpError.code}`, httpError.cause ?? httpError);
  }
  if (res.headersSent) {
    next(error);
    return;
  }
  if (httpError.retryAfterSeconds) res.setHeader('Retry-After', String(httpError.retryAfterSeconds));

  const body: ApiErrorBody = {
    error: {
      code: httpError.code,
      message: httpError.message,
      ...(httpError.retryAfterSeconds ? { retryAfterSeconds: httpError.retryAfterSeconds } : {}),
    },
  };
  res.status(httpError.status).json(body);
};
