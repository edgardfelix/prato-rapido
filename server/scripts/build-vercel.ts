import { existsSync } from 'node:fs';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'vite';
import { SECURITY_HEADERS, buildContentSecurityPolicy } from '../http/securityPolicy.ts';

/*
 * Vercel deployment in the Build Output API format (.vercel/output), made by
 * `npm run build:vercel` (the buildCommand in vercel.json):
 *
 *   static/              the Vite build (dist/), served by Vercel's CDN
 *   functions/api.func/  the Express API (server/index.ts) bundled into plain
 *                        JavaScript. Vercel never compiles TypeScript here: its
 *                        compiler relies on the TypeScript JS API, which
 *                        TypeScript 7 no longer ships.
 *   config.json          routing: /api/* → function, files, SPA fallback, headers
 *
 * https://vercel.com/docs/build-output-api
 */

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const DIST = path.join(ROOT, 'dist');
const OUTPUT = path.join(ROOT, '.vercel', 'output');
const FUNCTION_DIR = path.join(OUTPUT, 'functions', 'api.func');
/** A Vercel Node.js runtime: 24.x (the default) or 22.x. */
const NODE_RUNTIME = 'nodejs24.x';

/** Any path except /api and /api/… */
const NOT_API = '(?!api(?:/|$))';

async function writeJson(file: string, data: unknown): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
}

const indexHtmlPath = path.join(DIST, 'index.html');
if (!existsSync(indexHtmlPath)) {
  console.error('dist/index.html not found: run `npm run build` first (or `npm run build:vercel`).');
  process.exit(1);
}

await rm(OUTPUT, { recursive: true, force: true });

// 1. Front-end: the CDN serves the Vite build as is.
await cp(DIST, path.join(OUTPUT, 'static'), { recursive: true });

// 2. API: one ES module with every dependency inside (Node.js built-ins stay external).
await build({
  configFile: false,
  root: ROOT,
  mode: 'production',
  logLevel: 'warn',
  publicDir: false,
  // This bundle only runs on Vercel, even if the project hides the VERCEL system variable.
  define: { 'process.env.VERCEL': JSON.stringify('1') },
  ssr: { target: 'node', noExternal: true },
  build: {
    ssr: path.join(ROOT, 'server', 'index.ts'),
    outDir: FUNCTION_DIR,
    emptyOutDir: true,
    target: 'node22',
    minify: false,
    copyPublicDir: false,
    reportCompressedSize: false,
    rolldownOptions: {
      output: { format: 'es', entryFileNames: 'index.mjs', chunkFileNames: 'chunks/[name]-[hash].mjs' },
    },
  },
});

await writeJson(path.join(FUNCTION_DIR, '.vc-config.json'), {
  runtime: NODE_RUNTIME,
  handler: 'index.mjs',
  launcherType: 'Nodejs',
  // Express reads the raw request itself (the Cakto webhook signature covers the exact bytes): no Vercel helpers.
  shouldAddHelpers: false,
});

// 3. Routing, applied in order. Static files get the same headers Express sends locally.
const contentSecurityPolicy = buildContentSecurityPolicy(await readFile(indexHtmlPath, 'utf8'));
await writeJson(path.join(OUTPUT, 'config.json'), {
  version: 3,
  routes: [
    { src: `^/${NOT_API}.*$`, headers: { ...SECURITY_HEADERS }, continue: true },
    { src: `^/${NOT_API}(?!assets/).*$`, headers: { 'Content-Security-Policy': contentSecurityPolicy }, continue: true },
    // Hashed file names: safe to cache for a year.
    { src: '^/assets/.+$', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }, continue: true },
    // The function receives the original path (/api/generate-recipe…), which Express routes.
    { src: '^/api(?:/.*)?$', dest: '/api' },
    { handle: 'filesystem' },
    // SPA: client-side routes (/profile, /receita/:id…) render index.html; missing /assets files stay 404.
    { src: `^/${NOT_API}(?!assets/).*$`, methods: ['GET', 'HEAD'], dest: '/index.html', check: true },
  ],
});

console.log(`Vercel output ready: ${path.relative(ROOT, OUTPUT)} (static/ + functions/api.func on ${NODE_RUNTIME})`);
