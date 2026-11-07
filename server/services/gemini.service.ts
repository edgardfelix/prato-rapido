import {
  ApiError,
  FinishReason,
  GoogleGenAI,
  ThinkingLevel,
  type GenerateContentResponse,
  type Part,
} from '@google/genai';
import type { APIPayload } from '../../src/@types/api.ts';
import type { MediaAttachment } from '../../src/@types/media.ts';
import type { RecipeResponse } from '../../src/@types/recipe.ts';
import { env, type ThinkingLevelName } from '../config/env.ts';
import { buildRecipePrompt, buildRecipeSystemPrompt } from '../prompts/recipe.prompt.ts';
import { RECIPE_RESPONSE_SCHEMA, TRANSCRIPTION_RESPONSE_SCHEMA } from '../prompts/schemas.ts';
import { TRANSCRIPTION_SYSTEM_PROMPT, TRANSCRIPTION_USER_PROMPT } from '../prompts/transcription.prompt.ts';
import { HttpError } from '../utils/httpError.ts';
import { parseRecipeResponse, parseTranscription } from '../validation/aiResponse.validator.ts';

const THINKING_LEVELS: Record<ThinkingLevelName, ThinkingLevel> = {
  minimal: ThinkingLevel.MINIMAL,
  low: ThinkingLevel.LOW,
  medium: ThinkingLevel.MEDIUM,
  high: ThinkingLevel.HIGH,
};

/** Statuses worth retrying on the next model (404 covers a retired or unavailable model name). */
const FALLBACK_STATUSES = new Set([404, 408, 429, 500, 502, 503, 504]);

/** Whole-request budget across all models; stays below the web client's 70 s timeout. */
const REQUEST_BUDGET_MS = 55_000;
const MIN_ATTEMPT_MS = 3_000;

const MISSING_KEY_HINT =
  'Add GEMINI_API_KEY to the .env file (free key: https://aistudio.google.com/apikey) and restart the server.';

const BLOCKED_FINISH_REASONS = new Set<string>([
  FinishReason.SAFETY,
  FinishReason.PROHIBITED_CONTENT,
  FinishReason.BLOCKLIST,
  FinishReason.SPII,
  FinishReason.IMAGE_SAFETY,
  FinishReason.RECITATION,
]);

interface JsonRequest<T> {
  systemInstruction: string;
  parts: Part[];
  schema: object;
  temperature: number;
  maxOutputTokens: number;
  parse: (text: string) => T;
}

let client: GoogleGenAI | null = null;

/** Created lazily so demo mode never needs an API key. */
function getClient(): GoogleGenAI {
  if (!env.gemini.apiKey) {
    console.error(`[gemini] GEMINI_API_KEY is missing. ${MISSING_KEY_HINT}`);
    throw new HttpError(503, 'NOT_CONFIGURED', 'A IA não está configurada no servidor (GEMINI_API_KEY ausente).');
  }
  client ??= new GoogleGenAI({
    apiKey: env.gemini.apiKey,
    // Retries are handled here (with a model fallback) to keep latency predictable.
    httpOptions: { timeout: env.gemini.timeoutMs, retryOptions: { attempts: 1 } },
  });
  return client;
}

/* ---------------------------------------------------------------- Models */

/** Models that answered 404 (retired or not enabled for this key) are skipped until restart. */
const unavailableModels = new Set<string>();

/** Configured order: GEMINI_MODEL first, then GEMINI_FALLBACK_MODELS, without duplicates. */
export function getConfiguredModels(): string[] {
  return [...new Set([env.gemini.model, ...env.gemini.fallbackModels].filter(Boolean))];
}

function getModelChain(): string[] {
  const configured = getConfiguredModels();
  const usable = configured.filter((model) => !unavailableModels.has(model));
  // If every model was marked unavailable, try them all again instead of failing without a call.
  return usable.length > 0 ? usable : configured;
}

function markUnavailable(model: string): void {
  if (unavailableModels.has(model)) return;
  unavailableModels.add(model);
  console.error(
    `[gemini] Model "${model}" was not found (HTTP 404): it is retired or not available for this key. ` +
      'It will be skipped until the server restarts. Update GEMINI_MODEL / GEMINI_FALLBACK_MODELS in .env.',
  );
}

/**
 * Startup check (metadata only, no generation quota): reports which configured
 * models exist for this key, so a wrong model name shows up in the logs
 * before the first user request.
 */
export async function verifyGeminiModels(): Promise<void> {
  if (!env.gemini.apiKey) {
    console.warn(`[gemini] GEMINI_API_KEY is missing: running in DEMO mode with sample recipes. ${MISSING_KEY_HINT}`);
    return;
  }

  const models = getConfiguredModels();
  const results = await Promise.all(
    models.map(async (model) => {
      try {
        await getClient().models.get({ model });
        return { model, ok: true as const };
      } catch (error) {
        return { model, ok: false as const, status: error instanceof ApiError ? error.status : 0 };
      }
    }),
  );

  if (results.some((result) => !result.ok && (result.status === 401 || result.status === 403))) {
    console.error('[gemini] GEMINI_API_KEY was rejected (HTTP 401/403). Check the key in .env.');
    return;
  }

  for (const result of results) {
    if (result.ok) continue;
    if (result.status === 404) markUnavailable(result.model);
    else console.warn(`[gemini] Could not check model "${result.model}" (${result.status ? `HTTP ${result.status}` : 'network error'}).`);
  }

  const available = results.filter((result) => result.ok).map((result) => result.model);
  if (available.length === 0) {
    console.error('[gemini] None of the configured models is available. Recipes will fail until .env is fixed.');
  } else {
    console.log(`[gemini] Models ready (in order): ${available.join(' → ')}`);
  }
}

const toInlinePart = (media: MediaAttachment): Part => ({
  inlineData: { mimeType: media.mimeType, data: media.base64 },
});

export async function generateRecipeWithGemini(payload: APIPayload): Promise<{ recipe: RecipeResponse; model: string }> {
  const parts: Part[] = [{ text: buildRecipePrompt(payload) }];
  if (payload.image) parts.push(toInlinePart(payload.image));

  const { value, model } = await generateJson({
    // Base rules + the user's "USER CONTEXT ADAPTATION" block (appliances, goals, avoided ingredients).
    systemInstruction: buildRecipeSystemPrompt(payload.userContext),
    parts,
    schema: RECIPE_RESPONSE_SCHEMA,
    temperature: 0.8,
    maxOutputTokens: 4096,
    parse: parseRecipeResponse,
  });
  return { recipe: value, model };
}

export async function transcribeWithGemini(audio: MediaAttachment): Promise<string> {
  const { value } = await generateJson({
    systemInstruction: TRANSCRIPTION_SYSTEM_PROMPT,
    parts: [{ text: TRANSCRIPTION_USER_PROMPT }, toInlinePart(audio)],
    schema: TRANSCRIPTION_RESPONSE_SCHEMA,
    temperature: 0,
    maxOutputTokens: 1024,
    parse: parseTranscription,
  });
  return value;
}

/** Calls Gemini in JSON mode, validating the output and walking the fallback chain in order. */
async function generateJson<T>(request: JsonRequest<T>): Promise<{ value: T; model: string }> {
  const models = getModelChain();
  const deadline = Date.now() + REQUEST_BUDGET_MS;
  let lastError: unknown;

  for (const [index, model] of models.entries()) {
    const remainingMs = deadline - Date.now();
    if (remainingMs < MIN_ATTEMPT_MS) break;

    try {
      const text = await callModel(model, request, Math.min(env.gemini.timeoutMs, remainingMs), true);
      return { value: request.parse(text), model };
    } catch (error) {
      lastError = error;
      if (error instanceof ApiError && error.status === 404) markUnavailable(model);
      const nextModel = models[index + 1];
      if (!nextModel || !shouldTryNextModel(error)) break;
      console.warn(`[gemini] ${model} failed (${describeError(error)}); trying ${nextModel}.`);
    }
  }

  throw toHttpError(lastError);
}

async function callModel<T>(
  model: string,
  request: JsonRequest<T>,
  timeoutMs: number,
  withThinking: boolean,
): Promise<string> {
  try {
    const response = await getClient().models.generateContent({
      model,
      contents: [{ role: 'user', parts: request.parts }],
      config: {
        systemInstruction: request.systemInstruction,
        responseMimeType: 'application/json',
        responseJsonSchema: request.schema,
        temperature: request.temperature,
        maxOutputTokens: request.maxOutputTokens,
        abortSignal: AbortSignal.timeout(timeoutMs),
        ...(withThinking ? { thinkingConfig: { thinkingLevel: THINKING_LEVELS[env.gemini.thinkingLevel] } } : {}),
      },
    });
    return extractText(response);
  } catch (error) {
    // Some models (e.g. gemini-2.5-*) reject thinking levels: retry the same model once without them.
    if (withThinking && error instanceof ApiError && error.status === 400 && /thinking/i.test(error.message)) {
      return callModel(model, request, timeoutMs, false);
    }
    throw error;
  }
}

function extractText(response: GenerateContentResponse): string {
  const finishReason = response.candidates?.[0]?.finishReason;
  if (response.promptFeedback?.blockReason || (finishReason && BLOCKED_FINISH_REASONS.has(finishReason))) {
    throw new HttpError(
      422,
      'AI_BLOCKED',
      'Não consigo criar uma receita com esse conteúdo. Tente descrever outros ingredientes.',
    );
  }
  const text = response.text?.trim();
  if (!text) throw new HttpError(502, 'AI_INVALID_RESPONSE', 'A IA não retornou uma resposta. Tente novamente.');
  return text;
}

const isTimeout = (error: unknown) =>
  error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');

function shouldTryNextModel(error: unknown): boolean {
  if (error instanceof ApiError) return FALLBACK_STATUSES.has(error.status);
  if (error instanceof HttpError) return error.code === 'AI_INVALID_RESPONSE';
  return isTimeout(error);
}

/** Gemini quota errors usually say "Please retry in 34.5s". */
function readRetryDelaySeconds(message: string): number {
  const match = /retry in ([\d.]+)s/i.exec(message);
  const seconds = match?.[1] ? Math.ceil(Number(match[1])) : Number.NaN;
  return Number.isFinite(seconds) ? Math.min(Math.max(seconds, 5), 300) : 60;
}

function toHttpError(error: unknown): HttpError {
  if (error instanceof HttpError) return error;

  if (error instanceof ApiError) {
    const cause = { cause: error };
    switch (error.status) {
      case 400:
        return new HttpError(
          400,
          'BAD_REQUEST',
          'A IA não conseguiu processar esse conteúdo. Revise o texto, a foto ou o áudio e tente de novo.',
          cause,
        );
      case 401:
      case 403:
        return new HttpError(
          503,
          'NOT_CONFIGURED',
          'A chave do Gemini (GEMINI_API_KEY) é inválida ou não tem acesso a este modelo.',
          cause,
        );
      case 404:
        return new HttpError(503, 'AI_UNAVAILABLE', 'Modelo de IA não encontrado. Confira GEMINI_MODEL no arquivo .env.', cause);
      case 429:
        return new HttpError(429, 'RATE_LIMITED', 'O limite gratuito da IA foi atingido. Aguarde um pouco e tente novamente.', {
          ...cause,
          retryAfterSeconds: readRetryDelaySeconds(error.message),
        });
      default:
        return new HttpError(503, 'AI_UNAVAILABLE', 'O chef está sobrecarregado agora. Tente novamente em instantes.', cause);
    }
  }

  if (isTimeout(error)) {
    return new HttpError(504, 'TIMEOUT', 'A IA demorou demais para responder. Tente novamente.', { cause: error });
  }
  return new HttpError(502, 'AI_UNAVAILABLE', 'Não foi possível falar com a IA agora. Tente novamente em instantes.', {
    cause: error,
  });
}

function describeError(error: unknown): string {
  if (error instanceof ApiError) return `HTTP ${error.status}`;
  if (error instanceof HttpError) return error.code;
  if (error instanceof Error) return error.name;
  return 'unknown error';
}
