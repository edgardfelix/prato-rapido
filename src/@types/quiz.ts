/** Self-declared cooking skill, captured in onboarding step 2. */
export type CookingLevel = 'beginner' | 'intermediate' | 'advanced';

/** Dietary restrictions. An empty list means "no restrictions". */
export type DietaryRestriction =
  | 'vegetarian'
  | 'vegan'
  | 'gluten_free'
  | 'lactose_free'
  | 'low_carb'
  | 'sugar_free';

/** Time the user usually has to cook a meal. */
export type TimeAvailable = 'up_to_10' | 'from_10_to_15' | 'from_15_to_20';

/** Answers of the 3-step culinary quiz. */
export interface QuizData {
  cookingLevel: CookingLevel;
  dietaryRestrictions: DietaryRestriction[];
  timeAvailable: TimeAvailable;
}
