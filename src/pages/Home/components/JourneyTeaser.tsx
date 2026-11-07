import { ChevronRight, Flame } from 'lucide-react';
import { Link } from 'react-router';
import styled from 'styled-components';
import { JOURNEY_LENGTH } from '@/constants/journey';
import { useJourney } from '@/hooks/useJourney';
import { pressable } from '@/styles/mixins';

const Teaser = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  text-decoration: none;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.streakSoft};
  border: 1px solid color-mix(in srgb, ${({ theme }) => theme.colors.streak} 40%, transparent);
  color: ${({ theme }) => theme.colors.textSecondary};
  ${pressable(0.98)}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 2px;
  }
`;

const Icon = styled.span`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.streak};
  color: #ffffff;
`;

const Texts = styled.span`
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;

  strong {
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;

/** One-line nudge to the 30-day journey (streak + today's status). */
export function JourneyTeaser() {
  const { streak, todayDay, isTodayCompleted, isFinished, completedDays } = useJourney();
  const day = Math.min(Math.max(todayDay, 1), JOURNEY_LENGTH);

  const title = isFinished
    ? 'Jornada concluída!'
    : completedDays.size === 0
      ? 'Comece sua Jornada 30 Dias'
      : `${streak} ${streak === 1 ? 'dia seguido' : 'dias seguidos'}`;
  const subtitle = isFinished
    ? 'Veja suas conquistas e comece outra'
    : isTodayCompleted
      ? `Dia ${day} de ${JOURNEY_LENGTH} concluído`
      : `Dia ${day} de ${JOURNEY_LENGTH} · cozinhe hoje para marcar`;

  return (
    <Teaser to="/journey">
      <Icon aria-hidden="true">
        <Flame size={20} />
      </Icon>
      <Texts>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </Texts>
      <ChevronRight size={18} aria-hidden="true" />
    </Teaser>
  );
}
