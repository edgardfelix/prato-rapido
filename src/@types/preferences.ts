/** Appliances the user has at home. An empty list means "not informed" (standard kitchen). */
export type KitchenEquipment = 'stovetop' | 'oven' | 'airfryer' | 'microwave' | 'blender' | 'sandwich_maker';

export type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'quick_meals' | 'balanced_diet';

/**
 * AI personalization edited on the "Perfil & IA" page. It is persisted on the
 * device and sent as `userContext` with every recipe request.
 */
export interface UserAIContext {
  appliances: KitchenEquipment[];
  goals: FitnessGoal[];
  /** Free text such as "coentro" or "cebola"; never used in recipes. */
  dislikedIngredients: string[];
}
