import { randomBytes, randomInt } from 'node:crypto';
import type {
  ChallengeIconId,
  HumanChallenge,
  HumanChallengeAnswer,
  HumanVerification,
} from '../../src/@types/challenge.ts';
import { SERVER_LIMITS } from '../config/limits.ts';
import { CHALLENGE_ICONS } from '../domain/catalog.ts';
import { HttpError } from '../utils/httpError.ts';
import { hmac, safeEqual, signToken, verifyToken } from '../utils/signing.ts';

/*
 * "Verificação rápida": a stateless human check. The server picks the icon to
 * tap and signs the challenge; only an HMAC of the right answer travels in the
 * token, so the answer cannot be read from it. A correct answer is exchanged
 * for a signed human token (30 days) that the AI routes require, and each
 * token has its own rate limit. No database: the only state is a short-lived
 * in-memory list of used challenges, which blocks replaying one solution.
 *
 * This raises the cost of scripted abuse; it does not make abuse impossible
 * (no client-side puzzle can), so the per-IP and per-token limits stay the
 * real protection of the Gemini quota.
 */

const CHALLENGE_PURPOSE = 'human-challenge';
const ANSWER_PURPOSE = 'human-challenge-answer';
const HUMAN_PURPOSE = 'human-token';

const ICON_IDS = Object.keys(CHALLENGE_ICONS) as ChallengeIconId[];

/** Challenge nonces already answered (right or wrong) → their expiry. */
const usedChallenges = new Map<string, number>();

const sweep = setInterval(() => {
  const now = Date.now();
  for (const [nonce, expiresAt] of usedChallenges) {
    if (expiresAt <= now) usedChallenges.delete(nonce);
  }
}, SERVER_LIMITS.challengeTtlMs);
sweep.unref();

const randomId = (bytes: number) => randomBytes(bytes).toString('base64url');

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapWith = randomInt(index + 1);
    [copy[index], copy[swapWith]] = [copy[swapWith] as T, copy[index] as T];
  }
  return copy;
}

const answerDigest = (nonce: string, answer: string) => hmac(ANSWER_PURPOSE, `${nonce}:${answer}`);

export function createChallenge(now = Date.now()): HumanChallenge {
  const icons = shuffle(ICON_IDS).slice(0, SERVER_LIMITS.challengeOptions);
  const options = icons.map((icon) => ({ id: randomId(6), icon, label: CHALLENGE_ICONS[icon] }));
  const answer = options[randomInt(options.length)];
  if (!answer) throw new HttpError(500, 'INTERNAL', 'Não foi possível criar a verificação.');

  const nonce = randomId(12);
  const expiresAt = now + SERVER_LIMITS.challengeTtlMs;
  const token = signToken({ n: nonce, a: answerDigest(nonce, answer.id), e: expiresAt }, CHALLENGE_PURPOSE);
  return { token, target: answer.label, options, expiresAt: new Date(expiresAt).toISOString() };
}

const failed = (message: string) => new HttpError(400, 'CHALLENGE_FAILED', message);

/** Checks the answer and, when right, returns a signed human token. Every challenge works once. */
export function verifyChallenge({ token, answer }: HumanChallengeAnswer, now = Date.now()): HumanVerification {
  const claims = verifyToken(token, CHALLENGE_PURPOSE, SERVER_LIMITS.humanTokenMaxChars);
  const nonce = claims?.n;
  const digest = claims?.a;
  const expiresAt = claims?.e;
  if (typeof nonce !== 'string' || typeof digest !== 'string' || typeof expiresAt !== 'number') {
    throw failed('Verificação inválida. Carregue um novo desafio.');
  }
  if (expiresAt <= now) throw failed('O desafio expirou. Carregue um novo.');
  if (usedChallenges.has(nonce)) throw failed('Este desafio já foi usado. Carregue um novo.');

  // Burned on the first attempt, right or wrong: guessing means fetching new challenges (rate limited).
  usedChallenges.set(nonce, expiresAt);
  if (!safeEqual(answerDigest(nonce, answer), digest)) throw failed('Não foi esse ícone. Tente de novo com um novo desafio.');

  const humanExpiresAt = now + SERVER_LIMITS.humanTokenTtlMs;
  return {
    token: signToken({ v: 1, j: randomId(9), e: humanExpiresAt }, HUMAN_PURPOSE),
    expiresAt: new Date(humanExpiresAt).toISOString(),
  };
}

/** Id of a valid, unexpired human token (used as the per-browser rate-limit key), or null. */
export function readHumanToken(token: unknown, now = Date.now()): string | null {
  const claims = verifyToken(token, HUMAN_PURPOSE, SERVER_LIMITS.humanTokenMaxChars);
  if (!claims || claims.v !== 1 || typeof claims.j !== 'string' || typeof claims.e !== 'number') return null;
  return claims.e > now ? claims.j : null;
}
