import { env } from '../config/env.ts';
import { SERVER_LIMITS } from '../config/limits.ts';

/** Upstash could not run a command (not configured, network, auth or Redis error). Never contains the token. */
export class UpstashError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'UpstashError';
  }
}

type RedisArgument = string | number;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Runs one Redis command through the Upstash REST API: the command goes as a
 * JSON array in a POST body, the answer is `{ "result": ... }` or
 * `{ "error": "..." }`. No SDK needed, and nothing is retried silently.
 */
export async function upstashCommand(command: readonly RedisArgument[]): Promise<unknown> {
  const config = env.paywall.upstash;
  const name = String(command[0] ?? '');
  if (!config) throw new UpstashError('Upstash is not configured (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN).');

  let response: Response;
  try {
    response = await fetch(config.url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
      signal: AbortSignal.timeout(SERVER_LIMITS.upstashTimeoutMs),
    });
  } catch (cause) {
    throw new UpstashError(`Upstash ${name} failed: ${cause instanceof Error ? cause.message : 'network error'}`, { cause });
  }

  const body: unknown = await response.json().catch(() => null);
  if (response.ok && isRecord(body) && 'result' in body) return body.result;
  const detail = isRecord(body) && typeof body.error === 'string' ? body.error : `HTTP ${response.status}`;
  throw new UpstashError(`Upstash rejected ${name}: ${detail}`);
}

/** Read-only connectivity check used at startup. */
export async function pingUpstash(): Promise<boolean> {
  return (await upstashCommand(['PING'])) === 'PONG';
}
