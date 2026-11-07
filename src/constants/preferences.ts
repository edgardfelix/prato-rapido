import { Blender, Dumbbell, Fan, Flame, Heater, HeartPulse, Microwave, Sandwich, Scale, Zap, type LucideIcon } from 'lucide-react';
import type { FitnessGoal, KitchenEquipment } from '@/@types';

export interface PreferenceOption<TValue extends string> {
  value: TValue;
  label: string;
  description?: string;
  icon: LucideIcon;
}

export const EQUIPMENT_OPTIONS: PreferenceOption<KitchenEquipment>[] = [
  { value: 'stovetop', label: 'Fogão', icon: Flame },
  { value: 'oven', label: 'Forno', icon: Heater },
  { value: 'airfryer', label: 'Airfryer', icon: Fan },
  { value: 'microwave', label: 'Micro-ondas', icon: Microwave },
  { value: 'blender', label: 'Liquidificador', icon: Blender },
  { value: 'sandwich_maker', label: 'Sanduicheira', icon: Sandwich },
];

export const GOAL_OPTIONS: PreferenceOption<FitnessGoal>[] = [
  { value: 'weight_loss', label: 'Emagrecer', description: 'pratos leves que saciam', icon: Scale },
  { value: 'muscle_gain', label: 'Ganhar massa', description: 'mais proteína em cada prato', icon: Dumbbell },
  { value: 'quick_meals', label: 'Refeições rápidas', description: 'preparo com poucos passos', icon: Zap },
  { value: 'balanced_diet', label: 'Comer melhor', description: 'equilíbrio no dia a dia', icon: HeartPulse },
];

export const EQUIPMENT_VALUES = EQUIPMENT_OPTIONS.map((option) => option.value);
export const GOAL_VALUES = GOAL_OPTIONS.map((option) => option.value);

export const EQUIPMENT_LABELS = Object.fromEntries(
  EQUIPMENT_OPTIONS.map((option) => [option.value, option.label]),
) as Record<KitchenEquipment, string>;

export const GOAL_LABELS = Object.fromEntries(GOAL_OPTIONS.map((option) => [option.value, option.label])) as Record<
  FitnessGoal,
  string
>;

/** Common dislikes offered as one-tap suggestions. */
export const DISLIKE_SUGGESTIONS = ['Coentro', 'Cebola', 'Pimentão', 'Alho', 'Cogumelo', 'Azeitona', 'Uva-passa', 'Pimenta'];
