import {
  ChefHat,
  Droplets,
  Flame,
  Footprints,
  GlassWater,
  Milestone,
  PiggyBank,
  Recycle,
  Sparkles,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import type { BadgeId } from '@/@types';

export const JOURNEY_LENGTH = 30;
export const WATER_GOAL_CUPS = 8;
export const WATER_CUP_ML = 250;
export const WATER_MAX_CUPS = 12;

/**
 * Estimate shown as "economizados evitando delivery": what one home-cooked
 * meal saves compared with ordering the same meal by delivery. It is a
 * deliberately conservative assumption, labeled as such in the UI; adjust it here.
 */
export const SAVINGS_PER_MEAL_BRL = 15;

export type CelebrationTone = 'primary' | 'streak' | 'water' | 'gold';

/** Numbers the badges are measured against. */
export interface JourneyStats {
  completedDays: number;
  bestStreak: number;
  moneySaved: number;
  bestWaterCups: number;
  waterGoalDays: number;
  recipesGenerated: number;
  fridgeRecipes: number;
}

export interface BadgeDefinition {
  id: BadgeId;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: CelebrationTone;
  target: number;
  measure: (stats: JourneyStats) => number;
}

export const BADGES: BadgeDefinition[] = [
  {
    id: 'first_day',
    title: 'Primeiro passo',
    description: 'Conclua o primeiro dia',
    icon: Footprints,
    tone: 'primary',
    target: 1,
    measure: (stats) => stats.completedDays,
  },
  {
    id: 'streak_3',
    title: 'Fogo aceso',
    description: '3 dias seguidos',
    icon: Flame,
    tone: 'streak',
    target: 3,
    measure: (stats) => stats.bestStreak,
  },
  {
    id: 'streak_7',
    title: 'Semana de chef',
    description: '7 dias seguidos',
    icon: ChefHat,
    tone: 'streak',
    target: 7,
    measure: (stats) => stats.bestStreak,
  },
  {
    id: 'halfway',
    title: 'Meio caminho',
    description: '15 dias concluídos',
    icon: Milestone,
    tone: 'primary',
    target: 15,
    measure: (stats) => stats.completedDays,
  },
  {
    id: 'journey_complete',
    title: 'Jornada completa',
    description: '30 dias concluídos',
    icon: Trophy,
    tone: 'gold',
    target: 30,
    measure: (stats) => stats.completedDays,
  },
  {
    id: 'hydrated',
    title: 'Bem hidratado',
    description: '8 copos em um dia',
    icon: GlassWater,
    tone: 'water',
    target: WATER_GOAL_CUPS,
    measure: (stats) => stats.bestWaterCups,
  },
  {
    id: 'hydration_week',
    title: 'Hidratação em dia',
    description: 'Meta de água em 7 dias',
    icon: Droplets,
    tone: 'water',
    target: 7,
    measure: (stats) => stats.waterGoalDays,
  },
  {
    id: 'saver_100',
    title: 'Bolso feliz',
    description: 'R$ 100 economizados',
    icon: PiggyBank,
    tone: 'gold',
    target: 100,
    measure: (stats) => stats.moneySaved,
  },
  {
    id: 'fridge_hero',
    title: 'Anti-desperdício',
    description: '3 receitas Limpa Geladeira',
    icon: Recycle,
    tone: 'primary',
    target: 3,
    measure: (stats) => stats.fridgeRecipes,
  },
  {
    id: 'explorer',
    title: 'Explorador de sabores',
    description: 'Gere 10 receitas',
    icon: Sparkles,
    tone: 'gold',
    target: 10,
    measure: (stats) => stats.recipesGenerated,
  },
];

export const BADGE_IDS = BADGES.map((badge) => badge.id);
