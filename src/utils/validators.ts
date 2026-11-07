import type {
  AccessGrant,
  AccessStatusResponse,
  AppSettings,
  AvatarChoice,
  BadgeId,
  HumanVerification,
  JourneyState,
  QuizData,
  RecipeResponse,
  SavedRecipe,
  User,
  UserAIContext,
} from '@/@types';
import { AVATAR_ICON_IDS } from '@/constants/avatars';
import { BADGE_IDS, JOURNEY_LENGTH, WATER_MAX_CUPS } from '@/constants/journey';
import { LIMITS } from '@/constants/limits';
import { EQUIPMENT_VALUES, GOAL_VALUES } from '@/constants/preferences';
import { COOKING_LEVEL_VALUES, DIETARY_VALUES, TIME_VALUES } from '@/constants/quiz';
import { RECIPE_MODE_VALUES } from '@/constants/recipe';
import type { ThemeMode } from '@/styles/theme';
import { isDateKey } from './date';
import { isValidEmail } from './email';
import { normalizeText } from './format';

/*
 * Runtime guards for data read back from localStorage. Anything that fails
 * validation (old schema, manual edits, corruption) is repaired or discarded.
 */

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === 'string';

const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString);

const includes = <T extends string>(list: readonly T[], value: unknown): value is T =>
  typeof value === 'string' && (list as readonly string[]).includes(value);

const pickValues = <T extends string>(list: readonly T[], value: unknown): T[] =>
  Array.isArray(value) ? [...new Set(value.filter((item): item is T => includes(list, item)))] : [];

export const isThemeMode = (value: unknown): value is ThemeMode => value === 'dark' || value === 'light';

export function isQuizData(value: unknown): value is QuizData {
  return (
    isRecord(value) &&
    includes(COOKING_LEVEL_VALUES, value.cookingLevel) &&
    includes(TIME_VALUES, value.timeAvailable) &&
    Array.isArray(value.dietaryRestrictions) &&
    value.dietaryRestrictions.every((item) => includes(DIETARY_VALUES, item))
  );
}

export const DEFAULT_AVATAR: AvatarChoice = { kind: 'initials' };

export const createEmptyAIContext = (): UserAIContext => ({
  appliances: [],
  goals: [],
  dislikedIngredients: [],
});

/** Trims, de-duplicates (ignoring case and accents) and caps the list of disliked ingredients. */
export function sanitizeDislikedIngredients(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (!isString(value)) continue;
    const cleaned = value
      .replace(/[\r\n\t"`\\]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, LIMITS.dislikedMaxChars);
    const key = normalizeText(cleaned);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(cleaned);
    if (result.length >= LIMITS.dislikedMaxItems) break;
  }
  return result;
}

/** Also reads the previous storage shape (`cookingContext` with `kitchenEquipment` / `fitnessGoals`). */
export function sanitizeAIContext(value: unknown): UserAIContext {
  if (!isRecord(value)) return createEmptyAIContext();
  return {
    appliances: pickValues(EQUIPMENT_VALUES, value.appliances ?? value.kitchenEquipment),
    goals: pickValues(GOAL_VALUES, value.goals ?? value.fitnessGoals),
    dislikedIngredients: sanitizeDislikedIngredients(value.dislikedIngredients),
  };
}

export function sanitizeAvatar(value: unknown): AvatarChoice {
  if (!isRecord(value)) return DEFAULT_AVATAR;
  if (value.kind === 'icon' && includes(AVATAR_ICON_IDS, value.icon)) return { kind: 'icon', icon: value.icon };
  if (
    value.kind === 'photo' &&
    isString(value.dataUrl) &&
    value.dataUrl.startsWith('data:image/') &&
    value.dataUrl.length <= LIMITS.avatarMaxDataUrlChars
  ) {
    return { kind: 'photo', dataUrl: value.dataUrl };
  }
  return DEFAULT_AVATAR;
}

export function isRecipeResponse(value: unknown): value is RecipeResponse {
  return (
    isRecord(value) &&
    isString(value.nome_receita) &&
    isString(value.tempo_preparo) &&
    isString(value.dificuldade) &&
    isStringArray(value.ingredientes_utilizados) &&
    isStringArray(value.passo_a_passo) &&
    isString(value.dica_do_chef) &&
    isString(value.prompt_imagem)
  );
}

/** A valid saved recipe, or null. Entries from older versions get `batchCooking: false`. */
function toSavedRecipe(value: unknown): SavedRecipe | null {
  if (
    !isRecord(value) ||
    !isString(value.id) ||
    !isString(value.createdAt) ||
    !includes(RECIPE_MODE_VALUES, value.mode) ||
    !isString(value.imageUrl) ||
    typeof value.isDemo !== 'boolean' ||
    !isRecipeResponse(value.recipe) ||
    !isRecord(value.source) ||
    !isString(value.source.ingredientsText) ||
    !isStringArray(value.source.avoidRecipes)
  ) {
    return null;
  }
  return {
    id: value.id,
    createdAt: value.createdAt,
    mode: value.mode,
    recipe: value.recipe,
    imageUrl: value.imageUrl,
    isDemo: value.isDemo,
    source: {
      ingredientsText: value.source.ingredientsText,
      hasImage: value.source.hasImage === true,
      avoidRecipes: value.source.avoidRecipes,
      batchCooking: value.source.batchCooking === true,
    },
  };
}

/* Sanitizers for useLocalStorage: return a valid value or the fallback. */

export const sanitizeThemeMode = (value: unknown, fallback: ThemeMode): ThemeMode =>
  isThemeMode(value) ? value : fallback;

/** Users saved by older versions get defaults (no avatar or AI context) or are migrated (`cookingContext`). */
export function sanitizeUser(value: unknown, fallback: User | null): User | null {
  if (
    !isRecord(value) ||
    !isString(value.name) ||
    typeof value.age !== 'number' ||
    !isString(value.email) ||
    !isString(value.createdAt) ||
    !isQuizData(value.quiz)
  ) {
    return fallback;
  }
  return {
    name: value.name,
    age: value.age,
    email: value.email,
    quiz: value.quiz,
    avatar: sanitizeAvatar(value.avatar),
    aiContext: sanitizeAIContext(value.aiContext ?? value.cookingContext),
    createdAt: value.createdAt,
    updatedAt: isString(value.updatedAt) ? value.updatedAt : value.createdAt,
  };
}

export const sanitizeHistory = (value: unknown, fallback: SavedRecipe[]): SavedRecipe[] =>
  Array.isArray(value) ? value.map(toSavedRecipe).filter((recipe): recipe is SavedRecipe => recipe !== null) : fallback;

export const DEFAULT_SETTINGS: AppSettings = { soundEnabled: true };

export const sanitizeSettings = (value: unknown, fallback: AppSettings): AppSettings =>
  isRecord(value) && typeof value.soundEnabled === 'boolean' ? { soundEnabled: value.soundEnabled } : fallback;

/** This device's buyer access, only while the token has not expired. */
export function sanitizeAccessGrant(value: unknown, fallback: AccessGrant | null): AccessGrant | null {
  if (!isRecord(value) || !isString(value.email) || !isString(value.token) || !isString(value.expiresAt)) return fallback;
  if (value.token.length > 1024 || !isValidEmail(value.email)) return fallback;
  const expiresAt = Date.parse(value.expiresAt);
  return Number.isFinite(expiresAt) && expiresAt > Date.now()
    ? { email: value.email, token: value.token, expiresAt: value.expiresAt }
    : fallback;
}

/** Paywall status from the server; the checkout link must be https (it becomes an href). */
export function sanitizePaywallStatus(value: unknown, fallback: AccessStatusResponse | null): AccessStatusResponse | null {
  if (!isRecord(value) || typeof value.enabled !== 'boolean' || !isString(value.priceLabel)) return fallback;
  const { checkoutUrl } = value;
  if (checkoutUrl !== null && !(isString(checkoutUrl) && checkoutUrl.startsWith('https://') && checkoutUrl.length <= 500)) {
    return fallback;
  }
  return { enabled: value.enabled, checkoutUrl, priceLabel: value.priceLabel.slice(0, 40) };
}

/** A stored human-verification token, only while it has not expired. */
export function sanitizeVerification(value: unknown, fallback: HumanVerification | null): HumanVerification | null {
  if (!isRecord(value) || !isString(value.token) || value.token.length > 512 || !isString(value.expiresAt)) return fallback;
  const expiresAt = Date.parse(value.expiresAt);
  return Number.isFinite(expiresAt) && expiresAt > Date.now() ? { token: value.token, expiresAt: value.expiresAt } : fallback;
}

export function sanitizeJourney(value: unknown, fallback: JourneyState): JourneyState {
  if (!isRecord(value) || !isDateKey(value.startedOn)) return fallback;

  const completedDays = Array.isArray(value.completedDays)
    ? [
        ...new Set(
          value.completedDays.filter(
            (day): day is number => Number.isInteger(day) && day >= 1 && day <= JOURNEY_LENGTH,
          ),
        ),
      ].sort((a, b) => a - b)
    : [];

  const water = isRecord(value.water)
    ? Object.fromEntries(
        Object.entries(value.water)
          .filter((entry): entry is [string, number] => isDateKey(entry[0]) && Number.isFinite(entry[1]))
          .map(([day, cups]) => [day, Math.max(0, Math.min(WATER_MAX_CUPS, Math.round(cups)))]),
      )
    : {};

  const unlockedBadges = isRecord(value.unlockedBadges)
    ? (Object.fromEntries(
        Object.entries(value.unlockedBadges).filter(([id, day]) => includes(BADGE_IDS, id) && isDateKey(day)),
      ) as Partial<Record<BadgeId, string>>)
    : {};

  return { startedOn: value.startedOn, completedDays, water, unlockedBadges };
}
