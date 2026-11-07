import { useCallback, useMemo } from 'react';
import type {
  AvatarChoice,
  FitnessGoal,
  KitchenEquipment,
  QuizData,
  User,
  UserAIContext,
  UserProfile,
} from '@/@types';
import { WATER_GOAL_CUPS } from '@/constants/journey';
import { createEmptyAIContext } from '@/utils/validators';
import { useJourney } from './useJourney';
import { useUser } from './useUser';

/** Name, age, e-mail and the selected avatar. */
export interface ProfileSnapshot extends UserProfile {
  avatar: AvatarChoice;
}

/** The part of the "Jornada 30 Dias" most screens care about. */
export interface JourneySnapshot {
  /** Completed day numbers (1..30), ascending. */
  completedDays: number[];
  streak: number;
  waterToday: number;
  waterGoal: number;
  /** Estimated R$ saved by cooking at home instead of ordering delivery. */
  totalSavings: number;
}

export interface UserProfileApi {
  /** The full persisted user (null before onboarding). */
  user: User | null;
  profile: ProfileSnapshot | null;
  aiContext: UserAIContext;
  journey: JourneySnapshot;
  updateProfile: (profile: UserProfile) => void;
  setAvatar: (avatar: AvatarChoice) => void;
  updateQuiz: (quiz: Partial<QuizData>) => void;
  toggleAppliance: (appliance: KitchenEquipment) => void;
  toggleGoal: (goal: FitnessGoal) => void;
  setDislikedIngredients: (ingredients: string[]) => void;
  toggleJourneyDay: (day: number) => void;
  setWaterToday: (cups: number) => void;
}

const EMPTY_AI_CONTEXT = createEmptyAIContext();

const toggleValue = <T>(list: readonly T[], value: T): T[] =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

/**
 * Single entry point to everything personal the app keeps: profile + avatar,
 * the AI context sent with every recipe, and a journey snapshot, with focused
 * update helpers. Persistence (localStorage) and validation live in the
 * underlying providers, so every helper saves instantly.
 */
export function useUserProfile(): UserProfileApi {
  const { user, updateProfile, updateAvatar, updateQuiz, updateAIContext } = useUser();
  const { journey, streak, waterToday, moneySaved, toggleDay, setWaterToday } = useJourney();

  // Functional updates read the latest saved context, so quick successive taps never get lost.
  const toggleAppliance = useCallback(
    (appliance: KitchenEquipment) =>
      updateAIContext((current) => ({ appliances: toggleValue(current.appliances, appliance) })),
    [updateAIContext],
  );

  const toggleGoal = useCallback(
    (goal: FitnessGoal) => updateAIContext((current) => ({ goals: toggleValue(current.goals, goal) })),
    [updateAIContext],
  );

  const setDislikedIngredients = useCallback(
    (dislikedIngredients: string[]) => updateAIContext({ dislikedIngredients }),
    [updateAIContext],
  );

  const profile = useMemo<ProfileSnapshot | null>(
    () => (user ? { name: user.name, age: user.age, email: user.email, avatar: user.avatar } : null),
    [user],
  );

  const journeySnapshot = useMemo<JourneySnapshot>(
    () => ({
      completedDays: journey.completedDays,
      streak,
      waterToday,
      waterGoal: WATER_GOAL_CUPS,
      totalSavings: moneySaved,
    }),
    [journey.completedDays, streak, waterToday, moneySaved],
  );

  return useMemo<UserProfileApi>(
    () => ({
      user,
      profile,
      aiContext: user?.aiContext ?? EMPTY_AI_CONTEXT,
      journey: journeySnapshot,
      updateProfile,
      setAvatar: updateAvatar,
      updateQuiz,
      toggleAppliance,
      toggleGoal,
      setDislikedIngredients,
      toggleJourneyDay: toggleDay,
      setWaterToday,
    }),
    [
      user,
      profile,
      journeySnapshot,
      updateProfile,
      updateAvatar,
      updateQuiz,
      toggleAppliance,
      toggleGoal,
      setDislikedIngredients,
      toggleDay,
      setWaterToday,
    ],
  );
}
