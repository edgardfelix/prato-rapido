import { useState } from 'react';
import { CalendarCheck, Flame, PartyPopper, PiggyBank, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { ProgressBar } from '@/components/atoms/ProgressBar';
import { Header } from '@/components/organisms/Header';
import { Page, PageContent } from '@/components/templates/PageLayout';
import { JOURNEY_LENGTH, SAVINGS_PER_MEAL_BRL } from '@/constants/journey';
import { useJourney } from '@/hooks/useJourney';
import { useSound } from '@/hooks/useSound';
import { formatCurrencyBRL } from '@/utils/format';
import { BadgeGrid } from './components/BadgeGrid';
import { JourneyCalendar, type DayReward } from './components/JourneyCalendar';
import { AnimatedCount, AnimatedCurrency, StatCard } from './components/StatCard';
import { WaterTracker } from './components/WaterTracker';
import * as S from './styles';

export default function Journey() {
  const {
    journey,
    todayDay,
    isFinished,
    completedDays,
    isTodayCompleted,
    streak,
    bestStreak,
    moneySaved,
    toggleDay,
    completeToday,
    restartJourney,
  } = useJourney();
  const { play, haptic } = useSound();
  const [reward, setReward] = useState<DayReward | null>(null);
  const [isConfirmingRestart, setIsConfirmingRestart] = useState(false);

  const currentDay = Math.min(Math.max(todayDay, 1), JOURNEY_LENGTH);
  const completedCount = completedDays.size;

  /** Today opens the full celebration (from the journey); catch-up days get a lighter cue. */
  const handleToggle = (day: number) => {
    const wasCompleted = completedDays.has(day);
    toggleDay(day);
    if (wasCompleted) {
      play('uncheck');
      return;
    }
    setReward({ day, key: Date.now() });
    if (day !== todayDay) {
      play('success');
      haptic('light');
    }
  };

  const handleCompleteToday = () => {
    const result = completeToday();
    if (result.status === 'completed') setReward({ day: result.day, key: Date.now() });
  };

  const handleRestart = () => {
    if (!isConfirmingRestart) {
      setIsConfirmingRestart(true);
      return;
    }
    setIsConfirmingRestart(false);
    restartJourney();
  };

  return (
    <Page>
      <Header />
      <PageContent>
        <S.Intro>
          <S.Title>Jornada 30 Dias</S.Title>
          <S.Subtitle>
            {isFinished
              ? 'Você completou o ciclo. Que tal começar outro?'
              : 'Cozinhe em casa, beba água e desbloqueie conquistas.'}
          </S.Subtitle>
        </S.Intro>

        <S.StatsGrid>
          <StatCard
            tone="streak"
            icon={Flame}
            value={<AnimatedCount value={streak} />}
            label={streak === 1 ? 'dia seguido' : 'dias seguidos'}
            hint={`Recorde: ${bestStreak}`}
          />
          <StatCard
            tone="primary"
            icon={PiggyBank}
            value={<AnimatedCurrency value={moneySaved} />}
            label="economizados evitando delivery"
            hint="Estimativa"
          />
        </S.StatsGrid>

        <S.ProgressCard>
          <S.ProgressHeader>
            <strong>{isFinished ? 'Jornada encerrada' : `Dia ${currentDay} de ${JOURNEY_LENGTH}`}</strong>
            <span>
              {completedCount} de {JOURNEY_LENGTH} dias concluídos
            </span>
          </S.ProgressHeader>
          <ProgressBar value={completedCount / JOURNEY_LENGTH} label="Dias concluídos na jornada" />
        </S.ProgressCard>

        {isFinished ? (
          <S.FinishedCard>
            <Trophy size={28} aria-hidden="true" />
            <strong>Jornada concluída!</strong>
            <span>
              {completedCount} dias cozinhando em casa e cerca de {formatCurrencyBRL(moneySaved)} economizados.
            </span>
            <Button leftIcon={<PartyPopper size={18} />} onClick={restartJourney}>
              Começar nova jornada
            </Button>
          </S.FinishedCard>
        ) : (
          !isTodayCompleted && (
            <Button size="lg" fullWidth leftIcon={<CalendarCheck size={20} />} onClick={handleCompleteToday}>
              Cozinhei hoje: marcar o dia {currentDay}
            </Button>
          )
        )}

        <JourneyCalendar
          startedOn={journey.startedOn}
          todayDay={todayDay}
          completedDays={completedDays}
          reward={reward}
          onToggle={handleToggle}
        />

        <WaterTracker />
        <BadgeGrid />

        <S.Footer>
          <S.Footnote>
            A economia é uma estimativa conservadora de {formatCurrencyBRL(SAVINGS_PER_MEAL_BRL)} por refeição feita em
            casa no lugar de um pedido de delivery.
          </S.Footnote>
          {!isFinished && (
            <Button variant="ghost" leftIcon={<RotateCcw size={16} />} onClick={handleRestart}>
              {isConfirmingRestart ? 'Toque de novo para reiniciar do dia 1' : 'Reiniciar jornada'}
            </Button>
          )}
        </S.Footer>
      </PageContent>
    </Page>
  );
}
