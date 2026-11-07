import { createHash } from 'node:crypto';

/*
 * Security headers shared by the Express app and by the Vercel build
 * (server/scripts/build-vercel.ts), where the CDN serves the front-end and
 * applies these same values through the routing config.
 */

/** Baseline headers for every response. */
export const SECURITY_HEADERS: Readonly<Record<string, string>> = Object.freeze({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(self), microphone=(self), geolocation=(), payment=()',
});

/** Sent only over HTTPS. */
export const HSTS_HEADER = 'max-age=31536000; includeSubDomains';

/** Strict CSP for the built SPA. Inline scripts in index.html are allowed by hash. */
export function buildContentSecurityPolicy(html: string): string {
  const inlineScriptHashes = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(
    (match) => `'sha256-${createHash('sha256').update(match[1] ?? '').digest('base64')}'`,
  );

  return [
    "default-src 'self'",
    ["script-src 'self'", ...inlineScriptHashes].join(' '),
    // styled-components injects <style> tags at runtime.
    "style-src 'self' 'unsafe-inline'",
    // Food photos are proxied by /api/recipe-image, so no third-party image host is needed.
    "img-src 'self' data: blob:",
    // Vite inlines tiny font subsets as data: URLs.
    "font-src 'self' data:",
    "connect-src 'self'",
    "media-src 'self' blob: data:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
}
