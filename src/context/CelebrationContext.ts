import { createContext } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { CelebrationTone } from '@/constants/journey';

/** Something else reached in the same moment, shown as a chip in the same modal. */
export interface CelebrationExtra {
  icon: LucideIcon;
  title: string;
  tone: CelebrationTone;
}

export interface Celebration {
  id: number;
  tone: CelebrationTone;
  icon: LucideIcon;
  /** Small label above the title, e.g. "Conquista desbloqueada". */
  eyebrow?: string;
  title: string;
  description?: string;
  extras: CelebrationExtra[];
}

export type CelebrationInput = Omit<Celebration, 'id' | 'extras'>;

export interface CelebrationContextValue {
  /**
   * Opens the full-screen celebration (confetti, sound, vibration). Calls made
   * while a modal is still open (a finished day that also unlocks a badge)
   * join it as extra chips instead of stacking another modal.
   */
  celebrate: (celebration: CelebrationInput) => void;
}

export const CelebrationContext = createContext<CelebrationContextValue | null>(null);
