import type { Request, RequestHandler, Response } from 'express';
import { HttpError } from '../utils/httpError.ts';

interface RateLimiterOptions {
  name: string;
  windowMs: number;
  max: number;
  /** Bucket key; defaults to the client IP. Returning undefined also falls back to the IP. */
  keyOf?: (req: Request, res: Response) => string | undefined;
}

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Fixed-window rate limiter kept in memory (one instance per process), keyed
 * by IP or by a custom key such as the human-verification token. It protects
 * the free Gemini quota from abuse; use a shared store if you run several
 * instances behind a load balancer.
 */
export function createRateLimiter({ name, windowMs, max, keyOf }: RateLimiterOptions): RequestHandler {
  const buckets = new Map<string, Bucket>();

  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, Math.min(windowMs, 10 * 60_000));
  sweep.unref();

  return (req, res, next) => {
    const now = Date.now();
    const key = `${name}:${keyOf?.(req, res) ?? req.ip ?? 'unknown'}`;
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;

    const resetSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(Math.max(0, max - bucket.count)));
    res.setHeader('RateLimit-Reset', String(resetSeconds));

    if (bucket.count > max) {
      next(
        new HttpError(429, 'RATE_LIMITED', 'Muitas tentativas em pouco tempo. Aguarde alguns segundos e tente de novo.', {
          retryAfterSeconds: resetSeconds,
        }),
      );
      return;
    }
    next();
  };
}
