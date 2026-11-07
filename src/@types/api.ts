import type { MediaAttachment } from './media.ts';
import type { UserAIContext } from './preferences.ts';
import type { CookingLevel, DietaryRestriction, TimeAvailable } from './quiz.ts';
import type { RecipeMode, RecipeResponse } from './recipe.ts';

/**
 * Quiz-based profile sent to the AI. Name, e-mail and avatar are intentionally
 * excluded: the engine only needs what changes the recipe.
 */
export interface AIProfileContext {
  age: number;
  cookingLevel: CookingLevel;
  dietaryRestrictions: DietaryRestriction[];
  timeAvailable: TimeAvailable;
}

/** Body of `POST /api/generate-recipe`. */
export interface APIPayload {
  /** Free text typed or dictated by the user. May be empty when a photo is sent or in budget mode. */
  ingredientsText: string;
  /** Optional fridge/countertop photo for AI vision. */
  image?: MediaAttachment;
  mode: RecipeMode;
  profile: AIProfileContext;
  /**
   * Appliances, goals and disliked ingredients from "Perfil & IA". Optional on
   * the wire (the server treats a missing object as empty); always set after validation.
   */
  userContext: UserAIContext;
  /**
   * "Modo Marmitas": scale to about 4 portions that keep up to 4 days in the
   * fridge, with storage, reheating and freezing instructions. Optional on the
   * wire (defaults to false); always set after validation.
   */
  batchCooking: boolean;
  /** Recipe names the engine must not repeat (used by "Gerar outra opção"). */
  avoidRecipes?: string[];
}

/** Response of `POST /api/generate-recipe`. */
export interface GenerateRecipeResponse {
  recipe: RecipeResponse;
  imageUrl: string;
  model: string;
  isDemo: boolean;
}

/** Body of `POST /api/transcribe`. */
export interface TranscribeAudioPayload {
  audio: MediaAttachment;
}

/** Response of `POST /api/transcribe`. */
export interface TranscribeAudioResponse {
  text: string;
  isDemo: boolean;
}

/** Response of `GET /api/health`. */
export interface HealthResponse {
  status: 'ok';
  mode: 'ai' | 'demo';
  model: string | null;
}

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'ACCESS_REQUIRED'
  | 'ACCESS_UNAVAILABLE'
  | 'NOT_FOUND'
  | 'PAYLOAD_TOO_LARGE'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'RATE_LIMITED'
  | 'CHALLENGE_REQUIRED'
  | 'CHALLENGE_FAILED'
  | 'NO_INGREDIENTS'
  | 'AI_BLOCKED'
  | 'AI_INVALID_RESPONSE'
  | 'AI_UNAVAILABLE'
  | 'NOT_CONFIGURED'
  | 'TIMEOUT'
  | 'INTERNAL';

/** Error envelope returned by every API route. */
export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    /** Human-readable message in pt-BR, safe to show in the UI. */
    message: string;
    retryAfterSeconds?: number;
  };
}
