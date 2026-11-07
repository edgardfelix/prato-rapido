import type { ChallengeIconId } from '../../src/@types/challenge.ts';
import type { FitnessGoal, KitchenEquipment } from '../../src/@types/preferences.ts';
import type { CookingLevel, DietaryRestriction, TimeAvailable } from '../../src/@types/quiz.ts';
import type { RecipeMode } from '../../src/@types/recipe.ts';

/** PT-BR names of the icons used by the human check ("Toque em Cenoura"). */
export const CHALLENGE_ICONS: Record<ChallengeIconId, string> = {
  carrot: 'Cenoura',
  apple: 'Maçã',
  cherry: 'Cereja',
  banana: 'Banana',
  grape: 'Uva',
  citrus: 'Limão',
  egg: 'Ovo',
  fish: 'Peixe',
  croissant: 'Croissant',
  pizza: 'Pizza',
  coffee: 'Café',
  ice_cream: 'Sorvete',
  cake: 'Bolo',
  cookie: 'Biscoito',
  sandwich: 'Sanduíche',
  popcorn: 'Pipoca',
};

/*
 * Exhaustive maps (TypeScript fails the build if a value is missing) that
 * double as the allow-lists used by request validation.
 */

export const COOKING_LEVELS: Record<CookingLevel, string> = {
  beginner: 'Beginner: explain every technique simply, use basic utensils and avoid tricky techniques.',
  intermediate: 'Intermediate: comfortable with everyday techniques such as sautéing, searing and quick sauces.',
  advanced: 'Advanced: refined techniques and finishing touches are welcome, as long as the time limit holds.',
};

export const DIETARY_RESTRICTIONS: Record<DietaryRestriction, string> = {
  vegetarian: 'Vegetarian: no meat, poultry, fish or seafood (eggs and dairy are allowed).',
  vegan: 'Vegan: no animal products at all (no meat, fish, eggs, milk, cheese, butter, honey or gelatin).',
  gluten_free: 'Gluten-free: no wheat, rye, barley, regular oats or their derivatives (bread, pasta, flour, beer).',
  lactose_free: 'Lactose-free: no milk or dairy products that contain lactose.',
  low_carb: 'Low carb: avoid rice, pasta, bread, potatoes, sugar and flours.',
  sugar_free: 'Sugar-free: no added sugar, honey or syrups.',
};

export const TIME_AVAILABLE: Record<TimeAvailable, { label: string; maxMinutes: number }> = {
  up_to_10: { label: 'up to 10 minutes', maxMinutes: 10 },
  from_10_to_15: { label: '10 to 15 minutes', maxMinutes: 15 },
  from_15_to_20: { label: '15 to 20 minutes', maxMinutes: 20 },
};

export const RECIPE_MODES: Record<RecipeMode, string> = {
  standard: 'STANDARD: a practical, tasty everyday meal.',
  quick10:
    'QUICK 10-MINUTE MEAL ("Prato Rápido 10min"): the whole recipe must be ready in 10 minutes or less, with the fewest possible steps and dishes.',
  fridgeCleanup:
    'FRIDGE CLEAN-UP ("Limpa Geladeira"): use as many of the provided ingredients as possible, including leftovers, to avoid food waste.',
  budget:
    'BUDGET MEAL OF THE DAY ("Econômico do Dia"): minimize cost. If no ingredients are provided, use only cheap, common Brazilian pantry staples such as rice, beans, eggs, potatoes, onion, garlic, tomato, cassava flour, pasta and seasonal vegetables.',
};

export const KITCHEN_EQUIPMENT: Record<KitchenEquipment, string> = {
  stovetop: 'Gas stove / stovetop',
  oven: 'Oven',
  airfryer: 'Air fryer',
  microwave: 'Microwave',
  blender: 'Blender',
  sandwich_maker: 'Sandwich maker / contact grill',
};

/** `label` names the goal in the prompt; `guidance` tells the model how it changes the recipe. */
export const FITNESS_GOALS: Record<FitnessGoal, { label: string; guidance: string }> = {
  weight_loss: {
    label: 'Weight loss',
    guidance:
      'lighter, high-satiety dishes (vegetables, lean protein, fiber) with little added fat and sugar; prefer grilling, air frying or steaming over frying.',
  },
  muscle_gain: {
    label: 'Muscle gain',
    guidance: 'protein-rich dishes with a generous protein portion and a good carbohydrate source when the diet allows.',
  },
  quick_meals: {
    label: 'Quick meals',
    guidance: 'the fewest possible steps, minimal dishes and almost no waiting time.',
  },
  balanced_diet: {
    label: 'Balanced diet',
    guidance: 'combine vegetables, a protein and a carbohydrate source in sensible portions.',
  },
};

const hasKey = (record: object, key: unknown): boolean => typeof key === 'string' && Object.hasOwn(record, key);

export const isCookingLevel = (value: unknown): value is CookingLevel => hasKey(COOKING_LEVELS, value);
export const isDietaryRestriction = (value: unknown): value is DietaryRestriction =>
  hasKey(DIETARY_RESTRICTIONS, value);
export const isTimeAvailable = (value: unknown): value is TimeAvailable => hasKey(TIME_AVAILABLE, value);
export const isRecipeMode = (value: unknown): value is RecipeMode => hasKey(RECIPE_MODES, value);
export const isKitchenEquipment = (value: unknown): value is KitchenEquipment => hasKey(KITCHEN_EQUIPMENT, value);
export const isFitnessGoal = (value: unknown): value is FitnessGoal => hasKey(FITNESS_GOALS, value);
