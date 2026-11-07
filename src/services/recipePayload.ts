import type { APIPayload, User } from '@/@types';
import { LIMITS } from '@/constants/limits';
import { EQUIPMENT_VALUES, GOAL_VALUES } from '@/constants/preferences';
import { DIETARY_VALUES } from '@/constants/quiz';
import { RECIPE_MODE_VALUES } from '@/constants/recipe';
import type { RecipeRequest } from '@/context/RecipeContext';
import { pickAllowed, sanitizeText, sanitizeTextList } from '@/utils/sanitize';

/**
 * Builds the exact body of `POST /api/generate-recipe`: only known fields,
 * sanitized text, enums from allow-lists and the sizes the server accepts.
 * Name, e-mail and avatar never leave the device.
 */
export function buildRecipePayload(request: RecipeRequest, user: User, avoidRecipes: readonly string[]): APIPayload {
  return {
    ingredientsText: sanitizeText(request.ingredientsText, LIMITS.ingredientsMaxChars, { multiline: true }),
    ...(request.image ? { image: { base64: request.image.base64, mimeType: request.image.mimeType } } : {}),
    mode: RECIPE_MODE_VALUES.includes(request.mode) ? request.mode : 'standard',
    batchCooking: request.batchCooking === true,
    profile: {
      age: Math.min(LIMITS.userMaxAge, Math.max(LIMITS.userMinAge, Math.round(user.age))),
      cookingLevel: user.quiz.cookingLevel,
      dietaryRestrictions: pickAllowed(DIETARY_VALUES, user.quiz.dietaryRestrictions),
      timeAvailable: user.quiz.timeAvailable,
    },
    userContext: {
      appliances: pickAllowed(EQUIPMENT_VALUES, user.aiContext.appliances),
      goals: pickAllowed(GOAL_VALUES, user.aiContext.goals),
      dislikedIngredients: sanitizeTextList(user.aiContext.dislikedIngredients, {
        maxItems: LIMITS.dislikedMaxItems,
        maxChars: LIMITS.dislikedMaxChars,
      }),
    },
    avoidRecipes: sanitizeTextList(avoidRecipes, { maxItems: LIMITS.avoidRecipesMax, maxChars: LIMITS.avoidRecipeMaxChars }),
  };
}
