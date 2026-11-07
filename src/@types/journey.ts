export type BadgeId =
  | 'first_day'
  | 'streak_3'
  | 'streak_7'
  | 'halfway'
  | 'journey_complete'
  | 'hydrated'
  | 'hydration_week'
  | 'saver_100'
  | 'fridge_hero'
  | 'explorer';

/** Persisted state of the "Jornada 30 Dias". Dates are local calendar days (YYYY-MM-DD). */
export interface JourneyState {
  /** Day 1 of the journey. */
  startedOn: string;
  /** Completed day numbers (1..30). */
  completedDays: number[];
  /** Cups of water per day. */
  water: Record<string, number>;
  /** Day each badge was first unlocked; badges stay unlocked forever. */
  unlockedBadges: Partial<Record<BadgeId, string>>;
}
