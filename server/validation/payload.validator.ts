import type { CredentialsPayload, VerifyEmailPayload } from '../../src/@types/access.ts';
import type { AIProfileContext, APIPayload, TranscribeAudioPayload } from '../../src/@types/api.ts';
import type { HumanChallengeAnswer } from '../../src/@types/challenge.ts';
import type { MediaAttachment } from '../../src/@types/media.ts';
import type { UserAIContext } from '../../src/@types/preferences.ts';
import type { RecipeMode } from '../../src/@types/recipe.ts';
import { SERVER_LIMITS } from '../config/limits.ts';
import {
  DIETARY_RESTRICTIONS,
  FITNESS_GOALS,
  isCookingLevel,
  isDietaryRestriction,
  isFitnessGoal,
  isKitchenEquipment,
  isRecipeMode,
  isTimeAvailable,
  KITCHEN_EQUIPMENT,
} from '../domain/catalog.ts';
import { badRequest, HttpError } from '../utils/httpError.ts';
import { assertKnownKeys, isRecord, readList, readObject, readUserText } from './common.ts';
import { parseEmail } from './email.ts';
import { newPasswordProblem } from './password.ts';

/*
 * Request validation is strict: every object has a closed set of fields,
 * types must match exactly, and oversized strings or lists are rejected
 * (never truncated). Only content inside valid text is normalized.
 */

const RECIPE_KEYS = ['ingredientsText', 'image', 'mode', 'profile', 'userContext', 'avoidRecipes', 'batchCooking'];
const PROFILE_KEYS = ['age', 'cookingLevel', 'dietaryRestrictions', 'timeAvailable'];
const CONTEXT_KEYS = ['appliances', 'goals', 'dislikedIngredients'];
const MEDIA_KEYS = ['base64', 'mimeType'];

const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;
const CHALLENGE_ANSWER_PATTERN = /^[A-Za-z0-9_-]{4,32}$/;

const MIME_ALIASES: Record<string, string> = {
  'image/jpg': 'image/jpeg',
  'audio/x-wav': 'audio/wav',
  'audio/wave': 'audio/wav',
  'audio/mp4': 'audio/m4a',
  'audio/x-m4a': 'audio/m4a',
  'audio/mp3': 'audio/mpeg',
};

interface MediaRule {
  allowed: ReadonlySet<string>;
  maxBytes: number;
  messages: { missing: string; unsupported: string; corrupted: string; tooLarge: string };
}

const IMAGE_RULE: MediaRule = {
  allowed: new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']),
  maxBytes: SERVER_LIMITS.imageMaxBytes,
  messages: {
    missing: 'A foto enviada está em um formato inválido.',
    unsupported: 'Formato de foto não suportado. Use JPG, PNG ou WebP.',
    corrupted: 'Não foi possível ler a foto enviada. Tente outra imagem.',
    tooLarge: 'A foto é grande demais. Envie uma imagem menor.',
  },
};

const AUDIO_RULE: MediaRule = {
  allowed: new Set(['audio/wav', 'audio/webm', 'audio/ogg', 'audio/m4a', 'audio/aac', 'audio/mpeg', 'audio/flac', 'audio/opus']),
  maxBytes: SERVER_LIMITS.audioMaxBytes,
  messages: {
    missing: 'Envie o áudio para transcrição.',
    unsupported: 'Formato de áudio não suportado pelo navegador. Tente digitar os ingredientes.',
    corrupted: 'Não foi possível ler o áudio enviado. Grave novamente.',
    tooLarge: 'O áudio é longo demais. Grave uma mensagem mais curta.',
  },
};

function normalizeMimeType(mimeType: string): string {
  const base = mimeType.split(';')[0]?.trim().toLowerCase() ?? '';
  return MIME_ALIASES[base] ?? base;
}

function decodedSize(base64: string): number {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

function validateMedia(value: unknown, rule: MediaRule): MediaAttachment {
  if (!isRecord(value) || typeof value.base64 !== 'string' || typeof value.mimeType !== 'string') {
    throw badRequest(rule.messages.missing);
  }
  assertKnownKeys(value, MEDIA_KEYS, 'arquivo enviado');
  if (value.mimeType.length > 100) throw badRequest(rule.messages.unsupported);

  const mimeType = normalizeMimeType(value.mimeType);
  if (!rule.allowed.has(mimeType)) throw badRequest(rule.messages.unsupported);

  const base64 = value.base64.replace(/^data:[^,]*,/, '').replace(/\s/g, '');
  if (!base64 || base64.length % 4 !== 0 || !BASE64_PATTERN.test(base64)) throw badRequest(rule.messages.corrupted);
  if (decodedSize(base64) > rule.maxBytes) throw new HttpError(413, 'PAYLOAD_TOO_LARGE', rule.messages.tooLarge);

  return { base64, mimeType };
}

function validateProfile(value: unknown): AIProfileContext {
  const profile = readObject(value, 'Perfil ausente. Refaça o cadastro no app.');
  assertKnownKeys(profile, PROFILE_KEYS, 'perfil');

  const { age } = profile;
  if (typeof age !== 'number' || !Number.isInteger(age) || age < SERVER_LIMITS.ageMin || age > SERVER_LIMITS.ageMax) {
    throw badRequest('A idade do perfil é inválida.');
  }
  if (!isCookingLevel(profile.cookingLevel)) throw badRequest('O nível na cozinha do perfil é inválido.');
  if (!isTimeAvailable(profile.timeAvailable)) throw badRequest('O tempo disponível do perfil é inválido.');

  const restrictions = readList(
    profile.dietaryRestrictions,
    Object.keys(DIETARY_RESTRICTIONS).length,
    'O campo de restrições alimentares',
  );
  if (!restrictions.every(isDietaryRestriction)) throw badRequest('Há uma restrição alimentar inválida no perfil.');

  return {
    age,
    cookingLevel: profile.cookingLevel,
    timeAvailable: profile.timeAvailable,
    dietaryRestrictions: [...new Set(restrictions)],
  };
}

/**
 * `userContext` (appliances, goals, disliked ingredients). The object and each
 * field are optional, so a request without it means "no personalization".
 */
function validateUserContext(value: unknown): UserAIContext {
  if (value === undefined || value === null) return { appliances: [], goals: [], dislikedIngredients: [] };
  const context = readObject(value, 'O contexto de personalização enviado é inválido.');
  assertKnownKeys(context, CONTEXT_KEYS, 'contexto de personalização');

  const appliances = readList(context.appliances, Object.keys(KITCHEN_EQUIPMENT).length, 'O campo de eletrodomésticos');
  if (!appliances.every(isKitchenEquipment)) throw badRequest('Há um eletrodoméstico inválido no perfil.');

  const goals = readList(context.goals, Object.keys(FITNESS_GOALS).length, 'O campo de objetivos');
  if (!goals.every(isFitnessGoal)) throw badRequest('Há um objetivo inválido no perfil.');

  return {
    appliances: [...new Set(appliances)],
    goals: [...new Set(goals)],
    dislikedIngredients: readDislikedIngredients(context.dislikedIngredients),
  };
}

/**
 * Free text that ends up in the prompt. Structure is strict (count, type,
 * length, no HTML); then quotes, backticks, braces and backslashes are
 * stripped so an item can never break out of its data fence.
 */
function readDislikedIngredients(value: unknown): string[] {
  const items = readList(value, SERVER_LIMITS.dislikedMaxItems, 'O campo de ingredientes evitados');
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const text = readUserText(item, SERVER_LIMITS.dislikedMaxChars, 'Cada ingrediente evitado');
    const cleaned = text.replace(/["'`\\<>{}]/g, ' ').replace(/\s+/g, ' ').trim();
    const key = cleaned.toLowerCase();
    if (!cleaned || seen.has(key)) continue;
    seen.add(key);
    result.push(cleaned);
  }
  return result;
}

function readAvoidList(value: unknown): string[] {
  return readList(value, SERVER_LIMITS.avoidRecipesMax, 'O campo de receitas anteriores')
    .map((item) =>
      readUserText(item, SERVER_LIMITS.avoidRecipeMaxChars, 'Cada receita anterior')
        .replace(/["`\\]/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean);
}

function readMode(value: unknown): RecipeMode {
  if (value === undefined) return 'standard';
  if (!isRecipeMode(value)) throw badRequest('Modo de receita inválido.');
  return value;
}

function readBatchCooking(value: unknown): boolean {
  if (value === undefined) return false;
  if (typeof value !== 'boolean') throw badRequest('O Modo Marmitas deve ser ligado (true) ou desligado (false).');
  return value;
}

/** Validates and normalizes the body of `POST /api/generate-recipe`. */
export function validateRecipePayload(body: unknown): APIPayload {
  const payload = readObject(body, 'Envie os dados da receita em formato JSON.');
  assertKnownKeys(payload, RECIPE_KEYS, 'pedido de receita');

  const ingredientsText = readUserText(payload.ingredientsText, SERVER_LIMITS.ingredientsMaxChars, 'O campo de ingredientes', {
    optional: true,
  });
  const mode = readMode(payload.mode);
  const batchCooking = readBatchCooking(payload.batchCooking);
  const image = payload.image === undefined || payload.image === null ? undefined : validateMedia(payload.image, IMAGE_RULE);
  const profile = validateProfile(payload.profile);
  const userContext = validateUserContext(payload.userContext);
  const avoidRecipes = readAvoidList(payload.avoidRecipes);

  if (!ingredientsText && !image && mode !== 'budget') {
    throw badRequest('Informe ao menos um ingrediente, envie uma foto ou escolha o modo Econômico do Dia.');
  }

  return { ingredientsText, image, mode, profile, userContext, batchCooking, avoidRecipes };
}

/** Validates the body of `POST /api/transcribe`. */
export function validateTranscribePayload(body: unknown): TranscribeAudioPayload {
  const payload = readObject(body, AUDIO_RULE.messages.missing);
  assertKnownKeys(payload, ['audio'], 'pedido de transcrição');
  return { audio: validateMedia(payload.audio, AUDIO_RULE) };
}

/** Validates the body of `POST /api/verify-email` (the e-mail comes back normalized). */
export function validateVerifyEmailPayload(body: unknown): VerifyEmailPayload {
  const payload = readObject(body, 'Envie o e-mail em formato JSON.');
  assertKnownKeys(payload, ['email'], 'verificação de e-mail');
  const email = parseEmail(payload.email);
  if (!email) throw badRequest('Digite um e-mail válido, como nome@email.com.');
  return { email };
}

/**
 * Validates `{ email, password }`. A new password (first access) must also
 * pass the password policy; at login only its size is checked, so the answer
 * never hints at the policy.
 */
export function validateCredentialsPayload(body: unknown, kind: 'new-password' | 'login'): CredentialsPayload {
  const payload = readObject(body, 'Envie o e-mail e a senha em formato JSON.');
  assertKnownKeys(payload, ['email', 'password'], 'acesso');
  const email = parseEmail(payload.email);
  if (!email) throw badRequest('Digite um e-mail válido, como nome@email.com.');

  const { password } = payload;
  if (typeof password !== 'string' || password.length === 0) throw badRequest('Digite a sua senha.');
  if (password.length > SERVER_LIMITS.passwordMaxChars) throw badRequest('Senha longa demais.');
  if (kind === 'new-password') {
    const problem = newPasswordProblem(password, email);
    if (problem) throw new HttpError(400, 'WEAK_PASSWORD', problem);
  }
  return { email, password };
}

/** Validates the body of `POST /api/challenge/verify`. */
export function validateChallengeAnswer(body: unknown): HumanChallengeAnswer {
  const payload = readObject(body, 'Envie a resposta da verificação em formato JSON.');
  assertKnownKeys(payload, ['token', 'answer'], 'verificação');

  const { token, answer } = payload;
  if (typeof token !== 'string' || token.length === 0 || token.length > SERVER_LIMITS.humanTokenMaxChars) {
    throw new HttpError(400, 'CHALLENGE_FAILED', 'Verificação inválida. Carregue um novo desafio.');
  }
  if (typeof answer !== 'string' || !CHALLENGE_ANSWER_PATTERN.test(answer)) {
    throw new HttpError(400, 'CHALLENGE_FAILED', 'Resposta inválida. Toque em um dos ícones.');
  }
  return { token, answer };
}
