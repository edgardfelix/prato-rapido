import {
  CandyOff,
  Carrot,
  ChefHat,
  Clock,
  CookingPot,
  Egg,
  MilkOff,
  Salad,
  Timer,
  Utensils,
  Vegan,
  WheatOff,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { CookingLevel, DietaryRestriction, TimeAvailable } from '@/@types';

export interface QuizOption<TValue extends string> {
  value: TValue;
  label: string;
  description: string;
  icon: LucideIcon;
}

/** Sentinel used by the UI for "no restrictions" (stored as an empty list). */
export const NO_RESTRICTION = 'none' as const;
export type DietaryChoice = DietaryRestriction | typeof NO_RESTRICTION;

export const COOKING_LEVEL_OPTIONS: QuizOption<CookingLevel>[] = [
  { value: 'beginner', label: 'Iniciante', description: 'Estou aprendendo o básico', icon: Egg },
  { value: 'intermediate', label: 'Intermediário', description: 'Me viro bem no dia a dia', icon: CookingPot },
  { value: 'advanced', label: 'Avançado', description: 'Domino técnicas e temperos', icon: ChefHat },
];

export const DIETARY_OPTIONS: QuizOption<DietaryChoice>[] = [
  { value: NO_RESTRICTION, label: 'Nenhuma restrição', description: 'Como de tudo', icon: Utensils },
  { value: 'vegetarian', label: 'Vegetariana', description: 'Sem carnes, aves e peixes', icon: Salad },
  { value: 'vegan', label: 'Vegana', description: 'Nada de origem animal', icon: Vegan },
  { value: 'gluten_free', label: 'Sem glúten', description: 'Sem trigo, centeio e cevada', icon: WheatOff },
  { value: 'lactose_free', label: 'Sem lactose', description: 'Sem leite e derivados', icon: MilkOff },
  { value: 'low_carb', label: 'Low carb', description: 'Pouco carboidrato', icon: Carrot },
  { value: 'sugar_free', label: 'Sem açúcar', description: 'Sem açúcar adicionado', icon: CandyOff },
];

export const TIME_OPTIONS: QuizOption<TimeAvailable>[] = [
  { value: 'up_to_10', label: 'Até 10 minutos', description: 'Correria total', icon: Zap },
  { value: 'from_10_to_15', label: '10 a 15 minutos', description: 'O tempo ideal', icon: Timer },
  { value: 'from_15_to_20', label: '15 a 20 minutos', description: 'Dá para caprichar', icon: Clock },
];

export const COOKING_LEVEL_VALUES = COOKING_LEVEL_OPTIONS.map((option) => option.value);
export const DIETARY_VALUES = DIETARY_OPTIONS.map((option) => option.value).filter(
  (value): value is DietaryRestriction => value !== NO_RESTRICTION,
);
export const TIME_VALUES = TIME_OPTIONS.map((option) => option.value);

export const COOKING_LEVEL_LABELS: Record<CookingLevel, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

export const DIETARY_LABELS: Record<DietaryRestriction, string> = {
  vegetarian: 'Vegetariana',
  vegan: 'Vegana',
  gluten_free: 'Sem glúten',
  lactose_free: 'Sem lactose',
  low_carb: 'Low carb',
  sugar_free: 'Sem açúcar',
};

export const TIME_LABELS: Record<TimeAvailable, string> = {
  up_to_10: 'Até 10 min',
  from_10_to_15: '10–15 min',
  from_15_to_20: '15–20 min',
};
