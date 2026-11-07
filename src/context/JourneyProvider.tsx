import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { CalendarCheck, Flame, GlassWater } from 'lucide-react';
import type { JourneyState } from '@/@types';
import { JOURNEY_LENGTH, SAVINGS_PER_MEAL_BRL, WATER_GOAL_CUPS, WATER_MAX_CUPS } from '@/constants/journey';
import { STORAGE_KEYS } from '@/constants/storage';
import { useCelebration } from '@/hooks/useCelebration';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useRecipes } from '@/hooks/useRecipes';
import { useToast } from '@/hooks/useToast';
import { useToday } from '@/hooks/useToday';
import { formatCurrencyBRL } from '@/utils/format';
import {
  computeStats,
  computeStreak,
  createJourney,
  evaluateBadges,
  getDayNumber,
  pruneWater,
} from '@/utils/journey';
import { sanitizeJourney } from '@/utils/validators';
import { JourneyContext, type CompleteTodayResult, type JourneyContextValue } from './JourneyContext';

const sortDays = (days: Iterable<number>) => [...new Set(days)].sort((a, b) => a - b);

/**
 * "Jornada 30 Dias": completed days, streaks, water log, estimated savings and
 * badges. The journey starts on the first interaction and is stored locally.
 */
export function JourneyProvider({ children }: PropsWithChildren) {
  const today = useToday();
  const { history } = useRecipes();
  const { celebrate } = useCelebration();
  const { notify } = useToast();
  const [initialJourney] = useState(() => createJourney(today));
  const [journey, setJourney, removeJourney] = useLocalStorage<JourneyState>(
    STORAGE_KEYS.journey,
    initialJourney,
    sanitizeJourney,
  );

  const todayDay = getDayNumber(journey, today);
  const completedDays = useMemo(() => new Set(journey.completedDays), [journey.completedDays]);
  const streak = computeStreak(completedDays, todayDay);
  const stats = useMemo(() => computeStats(journey, history), [journey, history]);
  const badges = useMemo(() => evaluateBadges(stats, journey.unlockedBadges), [stats, journey.unlockedBadges]);
  const waterToday = journey.water[today] ?? 0;

  // Persist newly reached badges (they never lock again) and celebrate them.
  useEffect(() => {
    const fresh = badges.filter((badge) => badge.isUnlocked && !badge.unlockedOn);
    if (fresh.length === 0) return;
    setJourney((current) => ({
      ...current,
      unlockedBadges: { ...current.unlockedBadges, ...Object.fromEntries(fresh.map((badge) => [badge.id, today])) },
    }));
    // A badge reached together with a finished day merges into that day's modal.
    for (const badge of fresh) {
      celebrate({
        tone: badge.tone,
        icon: badge.icon,
        eyebrow: 'Conquista desbloqueada',
        title: badge.title,
        description: badge.description,
      });
    }
  }, [badges, celebrate, setJourney, today]);

  /** Full-screen celebration for checking off today (the key moment of the journey). */
  const celebrateDay = useCallback(
    (day: number, nextStreak: number) => {
      const savings = `+${formatCurrencyBRL(SAVINGS_PER_MEAL_BRL)} economizados evitando delivery.`;
      if (nextStreak > 1) {
        celebrate({
          tone: 'streak',
          icon: Flame,
          eyebrow: `Dia ${day} de ${JOURNEY_LENGTH} concluído`,
          title: `${nextStreak} dias seguidos!`,
          description: `${savings} Volte amanhã para manter o fogo aceso.`,
        });
        return;
      }
      celebrate({
        tone: 'primary',
        icon: CalendarCheck,
        eyebrow: 'Jornada 30 Dias',
        title: `Dia ${day} concluído!`,
        description: `${savings} Volte amanhã para começar uma sequência.`,
      });
    },
    [celebrate],
  );

  const toggleDay = useCallback(
    (day: number) => {
      if (day < 1 || day > Math.min(todayDay, JOURNEY_LENGTH)) return;
      const isCompleting = !completedDays.has(day);
      setJourney((current) => {
        const next = new Set(current.completedDays);
        if (next.has(day)) next.delete(day);
        else next.add(day);
        return { ...current, completedDays: sortDays(next) };
      });
      // Past days are catch-up marks; only today gets the full celebration.
      if (isCompleting && day === todayDay) celebrateDay(day, computeStreak(new Set([...completedDays, day]), todayDay));
    },
    [celebrateDay, completedDays, setJourney, todayDay],
  );

  const completeToday = useCallback((): CompleteTodayResult => {
    if (todayDay < 1 || todayDay > JOURNEY_LENGTH) return { status: 'unavailable' };
    if (completedDays.has(todayDay)) return { status: 'already', day: todayDay, streak };
    setJourney((current) => ({ ...current, completedDays: sortDays([...current.completedDays, todayDay]) }));
    const nextStreak = computeStreak(new Set([...completedDays, todayDay]), todayDay);
    celebrateDay(todayDay, nextStreak);
    return { status: 'completed', day: todayDay, streak: nextStreak };
  }, [celebrateDay, completedDays, setJourney, streak, todayDay]);

  const setWaterToday = useCallback(
    (cups: number) => {
      const next = Math.max(0, Math.min(WATER_MAX_CUPS, Math.round(cups)));
      setJourney((current) => ({ ...current, water: pruneWater({ ...current.water, [today]: next }, today) }));
      // The first time, the "Bem hidratado" badge gets the full celebration instead of this toast.
      if (waterToday < WATER_GOAL_CUPS && next >= WATER_GOAL_CUPS && journey.unlockedBadges.hydrated) {
        notify({ id: 'water-goal', icon: GlassWater, title: 'Meta de água batida!', description: '2 litros hoje. Seu corpo agradece.' });
      }
    },
    [notify, journey.unlockedBadges.hydrated, setJourney, today, waterToday],
  );

  const restartJourney = useCallback(() => {
    setJourney((current) => ({ ...createJourney(today), water: current.water, unlockedBadges: current.unlockedBadges }));
  }, [setJourney, today]);

  const resetJourney = useCallback(() => setJourney(createJourney(today)), [setJourney, today]);

  const value = useMemo<JourneyContextValue>(
    () => ({
      journey,
      today,
      todayDay,
      isFinished: todayDay > JOURNEY_LENGTH,
      completedDays,
      isTodayCompleted: completedDays.has(todayDay),
      streak,
      bestStreak: stats.bestStreak,
      moneySaved: stats.moneySaved,
      waterToday,
      badges,
      toggleDay,
      completeToday,
      setWaterToday,
      restartJourney,
      resetJourney,
      clearJourney: removeJourney,
    }),
    [
      journey,
      today,
      todayDay,
      completedDays,
      streak,
      stats,
      waterToday,
      badges,
      toggleDay,
      completeToday,
      setWaterToday,
      restartJourney,
      resetJourney,
      removeJourney,
    ],
  );

  return <JourneyContext value={value}>{children}</JourneyContext>;
}
