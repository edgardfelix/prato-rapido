import { createContext, type Dispatch, type SetStateAction } from 'react';
import type { ImageAttachment, MediaAttachment, RecipeMode, SavedRecipe } from '@/@types';
import type { ClientErrorCode } from '@/services/httpClient';

/** What the Home input currently holds (kept in memory, survives navigation). */
export interface InputDraft {
  text: string;
  image: ImageAttachment | null;
}

export interface RecipeRequest {
  ingredientsText: string;
  image?: MediaAttachment;
  mode: RecipeMode;
  /** "Modo Marmitas": portions for up to 4 days in the fridge. */
  batchCooking: boolean;
}

/** The generation in flight (or the last one that failed). */
export interface PendingGeneration {
  id: string;
  request: RecipeRequest;
  avoidRecipes: string[];
  clearDraftOnSuccess: boolean;
  status: 'loading' | 'error';
  error?: { code: ClientErrorCode; message: string };
}

export interface RecipeContextValue {
  history: SavedRecipe[];
  pending: PendingGeneration | null;
  draft: InputDraft;
  setDraft: Dispatch<SetStateAction<InputDraft>>;
  mode: RecipeMode;
  setMode: Dispatch<SetStateAction<RecipeMode>>;
  /** "Modo Marmitas" toggle on the Home composer (combines with any mode). */
  batchCooking: boolean;
  setBatchCooking: Dispatch<SetStateAction<boolean>>;
  /** Starts a generation and returns the id of the recipe that will be created. */
  generateRecipe: (request: RecipeRequest) => string | null;
  retryPending: () => void;
  /** Asks for a different recipe with the same ingredients. Returns the new id. */
  generateVariation: (recipe: SavedRecipe) => string | null;
  canGenerateVariation: (recipe: SavedRecipe) => boolean;
  getRecipe: (id: string) => SavedRecipe | undefined;
  clearHistory: () => void;
}

export const RecipeContext = createContext<RecipeContextValue | null>(null);
