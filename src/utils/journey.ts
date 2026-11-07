import type { BadgeId, JourneyState, SavedRecipe } from '@/@types';
import {
  BADGES,
  JOURNEY_LENGTH,
  SAVINGS_PER_MEAL_BRL,
  WATER_GOAL_CUPS,
  type BadgeDefinition,
  type JourneyStats,
} from '@/constants/journey';
import { addDays, diffInDays } from './date';

/* Pure journey rules, kept apart from React so they are easy to reason about and test. */

export const createJourney = (today: string): JourneyState => ({
  startedOn: today,
  completedDays: [],
  water: {},
  unlockedBadges: {},
});

/** Day number of `today` inside the journey (1 = start day). May exceed 30 once it is over. */
export const getDayNumber = (journey: JourneyState, today: string) => diffInDays(journey.startedOn, today) + 1;

export const getDateOfDay = (journey: JourneyState, day: number) => addDays(journey.startedOn, day - 1);

/**
 * Consecutive completed days ending today. An unchecked *today* does not
 * break the streak yet: it still counts from yesterday until midnight.
 */
export function computeStreak(completed: ReadonlySet<number>, todayDay: number): number {
  let day = Math.min(todayDay, JOURNEY_LENGTH);
  if (!completed.has(day)) day -= 1;
  let streak = 0;
  while (day >= 1 && completed.has(day)) {
    streak += 1;
    day -= 1;
  }
  return streak;
}

export function computeBestStreak(completed: ReadonlySet<number>): number {
  let best = 0;
  let current = 0;
  for (let day = 1; day <= JOURNEY_LENGTH; day += 1) {
    current = completed.has(day) ? current + 1 : 0;
    best = Math.max(best, current);
  }
  return best;
}

export function computeStats(journey: JourneyState, history: SavedRecipe[]): JourneyStats {
  const completed = new Set(journey.completedDays);
  const waterValues = Object.values(journey.water);
  return {
    completedDays: completed.size,
    bestStreak: computeBestStreak(completed),
    moneySaved: completed.size * SAVINGS_PER_MEAL_BRL,
    bestWaterCups: waterValues.reduce((best, cups) => Math.max(best, cups), 0),
    waterGoalDays: waterValues.filter((cups) => cups >= WATER_GOAL_CUPS).length,
    recipesGenerated: history.length,
    fridgeRecipes: history.filter((recipe) => recipe.mode === 'fridgeCleanup').length,
  };
}

export interface BadgeStatus extends BadgeDefinition {
  current: number;
  progress: number;
  unlockedOn?: string;
  isUnlocked: boolean;
}

export function evaluateBadges(stats: JourneyStats, unlocked: Partial<Record<BadgeId, string>>): BadgeStatus[] {
  return BADGES.map((badge) => {
    const current = Math.min(badge.measure(stats), badge.target);
    const unlockedOn = unlocked[badge.id];
    return {
      ...badge,
      current,
      progress: current / badge.target,
      unlockedOn,
      isUnlocked: Boolean(unlockedOn) || current >= badge.target,
    };
  });
}

/** Keeps the water log small: only the last `keepDays` days. */
export function pruneWater(water: Record<string, number>, today: string, keepDays = 45): Record<string, number> {
  return Object.fromEntries(Object.entries(water).filter(([day]) => diffInDays(day, today) < keepDays));
}
