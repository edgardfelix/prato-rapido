import { createContext } from 'react';
import type { AvatarChoice, QuizData, User, UserAIContext, UserProfile } from '@/@types';

/** A partial AI context, or a function of the latest one (safe for rapid successive toggles). */
export type AIContextChange = Partial<UserAIContext> | ((current: UserAIContext) => Partial<UserAIContext>);

export interface UserContextValue {
  user: User | null;
  isOnboarded: boolean;
  /** Creates or updates the profile and the quiz answers (onboarding). */
  saveUser: (profile: UserProfile, quiz: QuizData) => void;
  updateProfile: (profile: UserProfile) => void;
  updateQuiz: (quiz: Partial<QuizData>) => void;
  updateAIContext: (change: AIContextChange) => void;
  updateAvatar: (avatar: AvatarChoice) => void;
  /** Removes the profile from this device. */
  clearUser: () => void;
}

export const UserContext = createContext<UserContextValue | null>(null);
