/** Generation modes exposed by the Home quick action cards. */
export type RecipeMode = 'standard' | 'quick10' | 'fridgeCleanup' | 'budget';

/**
 * Exact JSON contract returned by the "Prato Rápido Engine" (Gemini, JSON mode).
 * Keys stay in Portuguese because they are part of the AI response schema.
 */
export interface RecipeResponse {
  nome_receita: string;
  tempo_preparo: string;
  dificuldade: string;
  ingredientes_utilizados: string[];
  passo_a_passo: string[];
  dica_do_chef: string;
  /** Short English prompt used to generate the food photo. */
  prompt_imagem: string;
}

/** What the user asked for, kept so a recipe can be regenerated ("Gerar outra opção"). */
export interface RecipeSource {
  ingredientsText: string;
  hasImage: boolean;
  avoidRecipes: string[];
  /** "Modo Marmitas" was on (missing in recipes saved by older versions = false). */
  batchCooking: boolean;
}

/** A generated recipe as stored in the local history. */
export interface SavedRecipe {
  id: string;
  createdAt: string;
  mode: RecipeMode;
  recipe: RecipeResponse;
  imageUrl: string;
  isDemo: boolean;
  source: RecipeSource;
}
