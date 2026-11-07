import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import express, { type Express } from 'express';
import { env } from '../config/env.ts';

/** Strict CSP for the built SPA. Inline scripts in index.html are allowed by hash. */
function buildContentSecurityPolicy(html: string): string {
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

/**
 * Serves the production build (`dist/`) with long-lived caching for hashed
 * assets and an SPA fallback. Returns false when the app has not been built.
 */
export function serveClientApp(app: Express): boolean {
  const indexPath = path.join(env.paths.dist, 'index.html');
  if (!existsSync(indexPath)) return false;

  const html = readFileSync(indexPath, 'utf8');
  const contentSecurityPolicy = buildContentSecurityPolicy(html);

  app.use(
    '/assets',
    express.static(path.join(env.paths.dist, 'assets'), { immutable: true, maxAge: '1y', index: false }),
  );
  app.use(
    express.static(env.paths.dist, {
      index: false,
      maxAge: '1h',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Content-Security-Policy', contentSecurityPolicy);
          res.setHeader('Cache-Control', 'no-cache');
        }
      },
    }),
  );

  // Client-side routes (/, /onboarding, /receita/:id) all render index.html.
  app.use((req, res, next) => {
    if ((req.method !== 'GET' && req.method !== 'HEAD') || req.path.startsWith('/api')) {
      next();
      return;
    }
    res.setHeader('Content-Security-Policy', contentSecurityPolicy);
    res.setHeader('Cache-Control', 'no-cache');
    res.type('html').send(html);
  });

  return true;
}
