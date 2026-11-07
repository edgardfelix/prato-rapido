import type { RequestHandler } from 'express';
import { env } from '../config/env.ts';
import { HttpError } from '../utils/httpError.ts';

/** Baseline security headers for every response. */
export const securityHeaders: RequestHandler = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=(), payment=()');
  if (req.secure) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
};

/** API responses carry user content and must never be cached. */
export const noStore: RequestHandler = (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
};

function isSameOrigin(origin: string, host: string | undefined): boolean {
  try {
    return Boolean(host) && new URL(origin).host === host;
  } catch {
    return false;
  }
}

/**
 * Origin allow-list + CORS. With ALLOWED_ORIGINS empty, browsers are limited
 * by the same-origin policy and no CORS headers are sent. When it is set, only
 * the listed origins (and the API's own origin) may call the API.
 */
export const originGuard: RequestHandler = (req, res, next) => {
  const origin = req.get('origin');
  if (!origin || env.allowedOrigins.length === 0 || isSameOrigin(origin, req.get('host'))) {
    next();
    return;
  }
  if (!env.allowedOrigins.includes(origin)) {
    next(new HttpError(403, 'FORBIDDEN', 'Origem não autorizada a usar esta API.'));
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Human-Token, X-Access-Token');
    res.setHeader('Access-Control-Max-Age', '600');
    res.sendStatus(204);
    return;
  }
  next();
};

/** One log line per API call: method, path, status and latency. */
export const requestLogger: RequestHandler = (req, res, next) => {
  const startedAt = performance.now();
  res.on('finish', () => {
    const duration = Math.round(performance.now() - startedAt);
    console.log(`[api] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration} ms)`);
  });
  next();
};
