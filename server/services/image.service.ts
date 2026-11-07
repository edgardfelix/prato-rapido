import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import type { RecipeResponse } from '../../src/@types/recipe.ts';
import { env } from '../config/env.ts';
import { HttpError } from '../utils/httpError.ts';
import { sign, verifySignature } from '../utils/signing.ts';

/*
 * Food photos come from Pollinations through this server instead of the
 * browser loading them directly, because:
 *  - the keyless endpoint allows 1 image every 45 s per IP and answers 402
 *    with a "limit reached" picture that an <img> cannot tell apart;
 *  - browser fetches with an Origin header are rejected (Turnstile);
 *  - images are generated once and cached on disk (thumbnails cost nothing);
 *  - an optional Pollinations key stays secret and user IPs stay private.
 */

const PHOTO_STYLE =
  'appetizing homemade dish, professional food photography, soft natural light, 45 degree angle, shallow depth of field, high detail, no text, no watermark';
const IMAGE_WIDTH = 1024;
const IMAGE_HEIGHT = 768;
const MAX_PROMPT_CHARS = 450;
const FREE_TIER_INTERVAL_MS = 45_000;
const MAX_RETRY_WAIT_MS = 50_000;
const MAX_QUEUE_WAIT_MS = 100_000;
const FETCH_TIMEOUT_MS = 60_000;
const MAX_ATTEMPTS = 3;
const MAX_CACHED_FILES = 400;

export interface RecipeImageRequest {
  prompt: string;
  seed: number;
}

export interface RecipeImage {
  data: Buffer;
  contentType: string;
}

/* ------------------------------------------------------------------ URLs */

/** FNV-1a hash: the same recipe always maps to the same seed (stable, cacheable image). */
function seedFrom(input: string): number {
  let hash = 0x811c9dc5;
  for (const character of input) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0) % 1_000_000_000;
}

const sanitizePrompt = (text: string) =>
  text
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[/\\?#%&]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const signaturePayload = ({ prompt, seed }: RecipeImageRequest) => `${seed}\n${prompt}`;

/** Signed, same-origin URL served by `GET /api/recipe-image`. */
export function buildRecipeImageUrl(recipe: RecipeResponse): string {
  const subject = sanitizePrompt(recipe.prompt_imagem || recipe.nome_receita);
  const prompt = `${subject}, ${PHOTO_STYLE}`.slice(0, MAX_PROMPT_CHARS);
  const seed = seedFrom(`${recipe.nome_receita}|${recipe.prompt_imagem}`);
  const params = new URLSearchParams({ prompt, seed: String(seed), sig: sign(signaturePayload({ prompt, seed })) });
  return `/api/recipe-image?${params.toString()}`;
}

export function parseRecipeImageQuery(query: Record<string, unknown>): RecipeImageRequest {
  const prompt = typeof query.prompt === 'string' ? query.prompt : '';
  const seed = Number(query.seed);
  const signature = typeof query.sig === 'string' ? query.sig : '';
  const isValid =
    prompt.length > 0 &&
    prompt.length <= MAX_PROMPT_CHARS &&
    Number.isInteger(seed) &&
    seed >= 0 &&
    signature.length > 0 &&
    verifySignature(signaturePayload({ prompt, seed }), signature);
  if (!isValid) throw new HttpError(400, 'BAD_REQUEST', 'Link de imagem inválido.');
  return { prompt, seed };
}

/* ----------------------------------------------------------------- Cache */

const cacheKey = ({ prompt, seed }: RecipeImageRequest) =>
  createHash('sha256').update(`${IMAGE_WIDTH}x${IMAGE_HEIGHT}|${seed}|${prompt}`).digest('hex').slice(0, 40);

const cacheFile = (key: string) => path.join(env.paths.imageCache, `${key}.img`);

function sniffContentType(data: Buffer): string {
  if (data[0] === 0xff && data[1] === 0xd8) return 'image/jpeg';
  if (data.subarray(0, 4).toString('hex') === '89504e47') return 'image/png';
  if (data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return 'application/octet-stream';
}

async function readCache(key: string): Promise<RecipeImage | null> {
  try {
    const data = await readFile(cacheFile(key));
    return { data, contentType: sniffContentType(data) };
  } catch {
    return null;
  }
}

async function pruneCache(): Promise<void> {
  const names = await readdir(env.paths.imageCache);
  if (names.length <= MAX_CACHED_FILES) return;
  const entries = await Promise.all(
    names.map(async (name) => ({ name, modifiedAt: (await stat(path.join(env.paths.imageCache, name))).mtimeMs })),
  );
  entries.sort((a, b) => a.modifiedAt - b.modifiedAt);
  await Promise.all(
    entries.slice(0, entries.length - MAX_CACHED_FILES).map((entry) => unlink(path.join(env.paths.imageCache, entry.name))),
  );
}

async function writeCache(key: string, data: Buffer): Promise<void> {
  try {
    await mkdir(env.paths.imageCache, { recursive: true });
    const temporary = `${cacheFile(key)}.${process.pid}.tmp`;
    await writeFile(temporary, data);
    await rename(temporary, cacheFile(key));
    void pruneCache().catch(() => undefined);
  } catch (error) {
    console.warn('[images] could not write the image cache:', error instanceof Error ? error.message : error);
  }
}

/* ------------------------------------------------------------ Generation */

function requestPollinations({ prompt, seed }: RecipeImageRequest): Promise<Response> {
  const params = new URLSearchParams({
    width: String(IMAGE_WIDTH),
    height: String(IMAGE_HEIGHT),
    seed: String(seed),
    nologo: 'true',
  });
  const headers: Record<string, string> = {
    Accept: 'image/jpeg,image/webp,image/png,image/*;q=0.8',
    'User-Agent': 'PratoRapido/1.0',
  };
  const encodedPrompt = encodeURIComponent(prompt);

  if (env.pollinationsApiKey) {
    headers.Authorization = `Bearer ${env.pollinationsApiKey}`;
    return fetch(`https://gen.pollinations.ai/image/${encodedPrompt}?${params}`, {
      headers,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  }
  return fetch(`https://image.pollinations.ai/prompt/${encodedPrompt}?${params}`, {
    headers,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
}

/** Earliest time the keyless tier accepts the next image from this server. */
let nextFreeSlotAt = 0;

async function generate(request: RecipeImageRequest): Promise<RecipeImage> {
  let lastStatus = 0;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    let response: Response;
    try {
      response = await requestPollinations(request);
    } catch {
      lastStatus = 0;
      if (attempt < MAX_ATTEMPTS) await delay(1_500 * attempt);
      continue;
    }

    lastStatus = response.status;
    const contentType = response.headers.get('content-type') ?? '';
    if (response.ok && contentType.startsWith('image/')) {
      const data = Buffer.from(await response.arrayBuffer());
      if (data.length > 2_048) return { data, contentType: sniffContentType(data) };
      continue;
    }

    await response.body?.cancel().catch(() => undefined);
    if (response.status === 402 || response.status === 429) {
      const retryAfterMs = (Number(response.headers.get('retry-after')) || 45) * 1_000;
      nextFreeSlotAt = Date.now() + retryAfterMs;
      if (attempt < MAX_ATTEMPTS && retryAfterMs <= MAX_RETRY_WAIT_MS) {
        await delay(retryAfterMs + 500);
        continue;
      }
      throw new HttpError(503, 'AI_UNAVAILABLE', 'O gerador de fotos gratuito está ocupado. Tente de novo em instantes.', {
        retryAfterSeconds: Math.ceil(retryAfterMs / 1_000),
      });
    }
    if (response.status < 500) break; // 4xx other than quota: retrying will not help
    if (attempt < MAX_ATTEMPTS) await delay(1_500 * attempt);
  }

  throw new HttpError(502, 'AI_UNAVAILABLE', 'Não foi possível gerar a foto do prato agora.', {
    cause: new Error(`Pollinations responded with status ${lastStatus || 'network error'}`),
  });
}

/** The keyless tier is paced: one image at a time, one every 45 seconds. */
let freeTierQueue: Promise<unknown> = Promise.resolve();

function enqueueFreeTier(request: RecipeImageRequest): Promise<RecipeImage> {
  const enqueuedAt = Date.now();
  const job = freeTierQueue.then(async () => {
    const wait = Math.max(0, nextFreeSlotAt - Date.now());
    if (Date.now() - enqueuedAt + wait > MAX_QUEUE_WAIT_MS) {
      throw new HttpError(503, 'AI_UNAVAILABLE', 'Muitas fotos sendo geradas agora. Tente de novo em instantes.', {
        retryAfterSeconds: Math.ceil(wait / 1_000),
      });
    }
    if (wait > 0) await delay(wait);
    try {
      return await generate(request);
    } finally {
      nextFreeSlotAt = Math.max(nextFreeSlotAt, Date.now() + FREE_TIER_INTERVAL_MS);
    }
  });
  freeTierQueue = job.catch(() => undefined);
  return job;
}

const inFlight = new Map<string, Promise<RecipeImage>>();

/** Cache → in-flight de-duplication → (paced) Pollinations call → cache. */
export function getRecipeImage(request: RecipeImageRequest): Promise<RecipeImage> {
  const key = cacheKey(request);
  const pending = inFlight.get(key);
  if (pending) return pending;

  const job = (async () => {
    const cached = await readCache(key);
    if (cached) return cached;
    const image = env.pollinationsApiKey ? await generate(request) : await enqueueFreeTier(request);
    await writeCache(key, image.data);
    return image;
  })().finally(() => inFlight.delete(key));

  inFlight.set(key, job);
  return job;
}
