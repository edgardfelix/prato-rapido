import { Lock } from 'lucide-react';
import styled from 'styled-components';
import { ProgressBar } from '@/components/atoms/ProgressBar';
import { Section, SectionHeader, SectionTitle } from '@/components/templates/PageLayout';
import type { CelebrationTone } from '@/constants/journey';
import { useJourney } from '@/hooks/useJourney';
import { cardSurface, visuallyHidden } from '@/styles/mixins';
import { toneColors } from '@/styles/tones';
import { formatDayMonth } from '@/utils/date';
import type { BadgeStatus } from '@/utils/journey';

const Count = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Grid = styled.ul`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`;

const Tile = styled.li<{ $unlocked: boolean; $tone: CelebrationTone }>`
  ${cardSurface}
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 12px 14px;
  text-align: center;
  border-color: ${({ theme, $unlocked, $tone }) => ($unlocked ? toneColors(theme, $tone).color : theme.colors.border)};
`;

const Medal = styled.span<{ $unlocked: boolean; $tone: CelebrationTone }>`
  position: relative;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  margin-bottom: 2px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme, $unlocked, $tone }) => ($unlocked ? toneColors(theme, $tone).soft : theme.colors.surfaceRaised)};
  color: ${({ theme, $unlocked, $tone }) => ($unlocked ? toneColors(theme, $tone).color : theme.colors.textTertiary)};

  svg:first-child {
    opacity: ${({ $unlocked }) => ($unlocked ? 1 : 0.45)};
  }
`;

const LockBadge = styled.span`
  position: absolute;
  right: -2px;
  bottom: -2px;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Title = styled.strong`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: ${({ theme }) => theme.lineHeights.snug};
`;

const Description = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Progress = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;

  span {
    font-size: 0.6875rem;
    font-variant-numeric: tabular-nums;
    color: ${({ theme }) => theme.colors.textTertiary};
  }
`;

const Status = styled.span`
  ${visuallyHidden}
`;

function BadgeTile({ badge }: { badge: BadgeStatus }) {
  const Icon = badge.icon;
  return (
    <Tile $unlocked={badge.isUnlocked} $tone={badge.tone}>
      <Medal $unlocked={badge.isUnlocked} $tone={badge.tone} aria-hidden="true">
        <Icon size={24} />
        {!badge.isUnlocked && (
          <LockBadge>
            <Lock size={11} />
          </LockBadge>
        )}
      </Medal>
      <Title>{badge.title}</Title>
      <Description>{badge.description}</Description>
      {badge.isUnlocked ? (
        <Description>{badge.unlockedOn ? `Desde ${formatDayMonth(badge.unlockedOn)}` : 'Desbloqueada'}</Description>
      ) : (
        <Progress>
          <ProgressBar value={badge.progress} label={`Progresso de ${badge.title}`} tone={badge.tone} height={4} />
          <span aria-hidden="true">
            {badge.current}/{badge.target}
          </span>
        </Progress>
      )}
      <Status>{badge.isUnlocked ? 'Conquista desbloqueada.' : 'Conquista bloqueada.'}</Status>
    </Tile>
  );
}

export function BadgeGrid() {
  const { badges } = useJourney();
  const unlocked = badges.filter((badge) => badge.isUnlocked).length;

  return (
    <Section aria-labelledby="badges-title">
      <SectionHeader>
        <SectionTitle id="badges-title">Conquistas</SectionTitle>
        <Count>
          {unlocked} de {badges.length}
        </Count>
      </SectionHeader>
      <Grid>
        {badges.map((badge) => (
          <BadgeTile key={badge.id} badge={badge} />
        ))}
      </Grid>
    </Section>
  );
}
