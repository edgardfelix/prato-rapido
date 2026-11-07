import express, { type RequestHandler } from 'express';
import { env } from '../config/env.ts';
import { readAccessToken } from '../services/access.service.ts';
import { isEmailStillAuthorized } from '../services/buyers.service.ts';
import { readHumanToken } from '../services/challenge.service.ts';
import { HttpError } from '../utils/httpError.ts';

/** Header that carries the signed token from "Verificação rápida". */
export const HUMAN_TOKEN_HEADER = 'x-human-token';
/** Header that carries the signed buyer access token (from `POST /api/verify-email`). */
export const ACCESS_TOKEN_HEADER = 'x-access-token';

/** Rejects bodies that are not JSON (415) before anything is parsed. */
export const requireJson: RequestHandler = (req, _res, next) => {
  if (!req.is('application/json')) {
    next(new HttpError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Envie os dados em JSON (Content-Type: application/json).'));
    return;
  }
  next();
};

/** Content-Type check + strict JSON parser with a per-route size limit (413 above it). */
export const jsonBody = (limit: string): RequestHandler[] => [requireJson, express.json({ limit, strict: true })];

/**
 * Paid access: with the paywall on, AI routes need a valid access token whose
 * purchase is still active (a refund or chargeback revokes it). The device
 * flag in localStorage is only a UI shortcut; this is the real lock.
 */
export const requireAccess: RequestHandler = async (req, _res, next) => {
  if (!env.paywall.enabled) {
    next();
    return;
  }
  const email = readAccessToken(req.get(ACCESS_TOKEN_HEADER));
  if (!email) {
    next(new HttpError(403, 'ACCESS_REQUIRED', 'Ative seu acesso com o e-mail da compra para continuar.'));
    return;
  }
  if (!(await isEmailStillAuthorized(email))) {
    next(new HttpError(403, 'ACCESS_REQUIRED', 'Seu acesso não está mais ativo. Confira o e-mail usado na compra.'));
    return;
  }
  next();
};

/**
 * AI routes require a valid human token (checked before the body is parsed).
 * Its id is exposed as `res.locals.humanId` for the per-token rate limit.
 */
export const requireHuman: RequestHandler = (req, res, next) => {
  const humanId = readHumanToken(req.get(HUMAN_TOKEN_HEADER));
  if (!humanId) {
    next(new HttpError(403, 'CHALLENGE_REQUIRED', 'Confirme que você não é um robô para continuar.'));
    return;
  }
  res.locals.humanId = humanId;
  next();
};
