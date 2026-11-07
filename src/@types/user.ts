import type { UserAIContext } from './preferences.ts';
import type { QuizData } from './quiz.ts';

/** Personal data captured in the first onboarding step. Stored only on the device. */
export interface UserProfile {
  name: string;
  age: number;
  email: string;
}

export type AvatarIconId =
  // Gourmet
  | 'chef'
  | 'carrot'
  | 'apple'
  | 'cherry'
  | 'pizza'
  | 'fish'
  | 'egg'
  | 'croissant'
  | 'coffee'
  | 'citrus'
  | 'cooking_pot'
  | 'cake'
  // Tech
  | 'bot'
  | 'cpu'
  | 'rocket'
  | 'gamepad'
  | 'headphones'
  | 'code';

/** Initials (default), one of the preset icons, or a small photo stored as a data URL. */
export type AvatarChoice =
  | { kind: 'initials' }
  | { kind: 'icon'; icon: AvatarIconId }
  | { kind: 'photo'; dataUrl: string };

/** The persisted user: profile, quiz answers, AI context and audit timestamps (ISO 8601). */
export interface User extends UserProfile {
  quiz: QuizData;
  aiContext: UserAIContext;
  avatar: AvatarChoice;
  createdAt: string;
  updatedAt: string;
}
