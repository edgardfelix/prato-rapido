import type { FitnessGoal } from './preferences.ts';

export type TipCategory = 'healthy_swaps' | 'storage' | 'quick_prep';

export interface Tip {
  id: string;
  category: TipCategory;
  title: string;
  summary: string;
  details: string[];
  /** Goals this tip is especially useful for (drives the "Para seu objetivo" tag). */
  goals: FitnessGoal[];
}
