import { useId } from 'react';
import { Check } from 'lucide-react';
import styled, { css } from 'styled-components';
import { JOURNEY_LENGTH, SAVINGS_PER_MEAL_BRL } from '@/constants/journey';
import { floatUp, popIn } from '@/styles/animations';
import { cardSurface, pressable } from '@/styles/mixins';
import { addDays, formatDayMonth } from '@/utils/date';

type DayState = 'done' | 'today' | 'missed' | 'locked';

const STATE_LABELS: Record<DayState, string> = {
  done: 'concluído',
  today: 'hoje, toque para marcar',
  missed: 'não marcado, toque para marcar',
  locked: 'ainda não chegou',
};

const Card = styled.section`
  ${cardSurface}
  padding: 18px;
`;

const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 14px;

  h2 {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }
`;

const Legend = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Grid = styled.ol`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
`;

const stateStyles: Record<DayState, ReturnType<typeof css>> = {
  done: css`
    background: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.onPrimary};
  `,
  today: css`
    background: ${({ theme }) => theme.colors.streakSoft};
    border-color: ${({ theme }) => theme.colors.streak};
    color: ${({ theme }) => theme.colors.textPrimary};
  `,
  missed: css`
    background: ${({ theme }) => theme.colors.surfaceRaised};
    border-color: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.textSecondary};
  `,
  locked: css`
    background: transparent;
    border-style: dashed;
    border-color: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.textTertiary};
  `,
};

const Day = styled.button<{ $state: DayState; $celebrate: boolean }>`
  position: relative;
  display: flex;
  width: 100%;
  aspect-ratio: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  border: 1.5px solid transparent;
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-variant-numeric: tabular-nums;
  ${pressable(0.9)}
  ${({ $state }) => stateStyles[$state]}
  ${({ $celebrate }) =>
    $celebrate &&
    css`
      animation: ${popIn} 480ms ${({ theme }) => theme.motion.easeOut};
    `}

  &:disabled {
    cursor: default;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 2px;
  }
`;

const TodayLabel = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.5625rem;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.streak};
`;

const Reward = styled.span`
  position: absolute;
  top: -12px;
  left: 50%;
  z-index: 2;
  margin-left: -28px;
  width: 56px;
  padding: 2px 0;
  text-align: center;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.6875rem;
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  pointer-events: none;
  animation: ${floatUp} 1.3s ${({ theme }) => theme.motion.easeOut} both;
`;

export interface DayReward {
  day: number;
  key: number;
}

interface JourneyCalendarProps {
  startedOn: string;
  todayDay: number;
  completedDays: ReadonlySet<number>;
  reward: DayReward | null;
  onToggle: (day: number) => void;
}

/** 30-day roadmap: completed, today, missed (still checkable) and future days. */
export function JourneyCalendar({ startedOn, todayDay, completedDays, reward, onToggle }: JourneyCalendarProps) {
  const titleId = useId();

  return (
    <Card aria-labelledby={titleId}>
      <Header>
        <h2 id={titleId}>Seu roteiro</h2>
        <Legend>Toque em um dia para marcar</Legend>
      </Header>
      <Grid>
        {Array.from({ length: JOURNEY_LENGTH }, (_, index) => {
          const day = index + 1;
          const state: DayState = completedDays.has(day)
            ? 'done'
            : day === todayDay
              ? 'today'
              : day < todayDay
                ? 'missed'
                : 'locked';
          const date = formatDayMonth(addDays(startedOn, index));

          return (
            <li key={day}>
              <Day
                type="button"
                $state={state}
                $celebrate={reward?.day === day && state === 'done'}
                aria-pressed={state === 'done'}
                aria-label={`Dia ${day}, ${date}: ${STATE_LABELS[state]}`}
                disabled={state === 'locked'}
                onClick={() => onToggle(day)}
              >
                {state === 'done' ? (
                  <Check size={18} strokeWidth={3} aria-hidden="true" />
                ) : (
                  <span aria-hidden="true">{day}</span>
                )}
                {state === 'today' && <TodayLabel aria-hidden="true">Hoje</TodayLabel>}
                {reward?.day === day && state === 'done' && (
                  <Reward key={reward.key} aria-hidden="true">
                    +R$ {SAVINGS_PER_MEAL_BRL}
                  </Reward>
                )}
              </Day>
            </li>
          );
        })}
      </Grid>
    </Card>
  );
}
