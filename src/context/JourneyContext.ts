import { createContext } from 'react';
import type { JourneyState } from '@/@types';
import type { BadgeStatus } from '@/utils/journey';

export type CompleteTodayResult =
  | { status: 'completed'; day: number; streak: number }
  | { status: 'already'; day: number; streak: number }
  | { status: 'unavailable' };

export interface JourneyContextValue {
  journey: JourneyState;
  /** Today's local date key (YYYY-MM-DD). */
  today: string;
  /** Today's day number in the journey (1..30; above 30 once it is over). */
  todayDay: number;
  isFinished: boolean;
  completedDays: ReadonlySet<number>;
  isTodayCompleted: boolean;
  streak: number;
  bestStreak: number;
  moneySaved: number;
  waterToday: number;
  badges: BadgeStatus[];
  /** Toggles a day; only days up to today can be changed. */
  toggleDay: (day: number) => void;
  completeToday: () => CompleteTodayResult;
  setWaterToday: (cups: number) => void;
  /** New 30-day cycle from today, keeping the water log and unlocked badges. */
  restartJourney: () => void;
  /** "Resetar progresso": new cycle from today with no days, water or badges. */
  resetJourney: () => void;
  /** Removes the journey from this device ("Apagar dados da conta"). */
  clearJourney: () => void;
}

export const JourneyContext = createContext<JourneyContextValue | null>(null);
