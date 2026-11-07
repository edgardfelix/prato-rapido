import { useCallback, useMemo, type PropsWithChildren } from 'react';
import type { AvatarChoice, QuizData, User, UserProfile } from '@/@types';
import { LIMITS } from '@/constants/limits';
import { STORAGE_KEYS } from '@/constants/storage';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  createEmptyAIContext,
  DEFAULT_AVATAR,
  sanitizeDislikedIngredients,
  sanitizeUser,
} from '@/utils/validators';
import { sanitizeText } from '@/utils/sanitize';
import { UserContext, type AIContextChange, type UserContextValue } from './UserContext';

const now = () => new Date().toISOString();

/** Plain text only (no markup or invisible characters), within the form limits. */
const cleanProfile = (profile: UserProfile): UserProfile => ({
  name: sanitizeText(profile.name, LIMITS.profileNameMaxChars),
  age: Math.round(profile.age),
  email: sanitizeText(profile.email, LIMITS.profileEmailMaxChars).toLowerCase(),
});

/** Holds the profile, quiz answers, avatar and AI context, persisted in localStorage only. */
export function UserProvider({ children }: PropsWithChildren) {
  const [user, setUser, removeUser] = useLocalStorage<User | null>(STORAGE_KEYS.user, null, sanitizeUser);

  const saveUser = useCallback(
    (profile: UserProfile, quiz: QuizData) => {
      setUser((previous) => {
        const timestamp = now();
        return {
          ...cleanProfile(profile),
          quiz,
          avatar: previous?.avatar ?? DEFAULT_AVATAR,
          aiContext: previous?.aiContext ?? createEmptyAIContext(),
          createdAt: previous?.createdAt ?? timestamp,
          updatedAt: timestamp,
        };
      });
    },
    [setUser],
  );

  /** Applies a change to an existing user (no-op before onboarding). */
  const patchUser = useCallback(
    (change: (current: User) => Partial<User>) => {
      setUser((previous) => (previous ? { ...previous, ...change(previous), updatedAt: now() } : previous));
    },
    [setUser],
  );

  const updateProfile = useCallback((profile: UserProfile) => patchUser(() => cleanProfile(profile)), [patchUser]);

  const updateQuiz = useCallback(
    (quiz: Partial<QuizData>) => patchUser((current) => ({ quiz: { ...current.quiz, ...quiz } })),
    [patchUser],
  );

  const updateAIContext = useCallback(
    (change: AIContextChange) =>
      patchUser((current) => {
        const patch = typeof change === 'function' ? change(current.aiContext) : change;
        const next = { ...current.aiContext, ...patch };
        return { aiContext: { ...next, dislikedIngredients: sanitizeDislikedIngredients(next.dislikedIngredients) } };
      }),
    [patchUser],
  );

  const updateAvatar = useCallback((avatar: AvatarChoice) => patchUser(() => ({ avatar })), [patchUser]);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      isOnboarded: user !== null,
      saveUser,
      updateProfile,
      updateQuiz,
      updateAIContext,
      updateAvatar,
      clearUser: removeUser,
    }),
    [user, saveUser, updateProfile, updateQuiz, updateAIContext, updateAvatar, removeUser],
  );

  return <UserContext value={value}>{children}</UserContext>;
}
