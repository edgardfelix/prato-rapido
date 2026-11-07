import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import styled from 'styled-components';
import type { CelebrationTone } from '@/constants/journey';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { cardSurface } from '@/styles/mixins';
import { toneColors } from '@/styles/tones';
import { formatCurrencyBRL } from '@/utils/format';

const Card = styled.div<{ $tone: CelebrationTone }>`
  ${cardSurface}
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding: 16px;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: -40px;
    right: -40px;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: ${({ theme, $tone }) => toneColors(theme, $tone).soft};
    pointer-events: none;
  }
`;

const IconTile = styled.span<{ $tone: CelebrationTone }>`
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  margin-bottom: 6px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme, $tone }) => toneColors(theme, $tone).soft};
  color: ${({ theme, $tone }) => toneColors(theme, $tone).color};
`;

const Value = styled.strong`
  position: relative;
  z-index: 1;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.75rem;
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.03em;
  line-height: 1.1;
`;

const Label = styled.span`
  position: relative;
  z-index: 1;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: ${({ theme }) => theme.lineHeights.snug};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Hint = styled.span<{ $tone: CelebrationTone }>`
  position: relative;
  z-index: 1;
  margin-top: 4px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme, $tone }) => toneColors(theme, $tone).color};
`;

interface StatCardProps {
  tone: CelebrationTone;
  icon: LucideIcon;
  value: ReactNode;
  label: string;
  hint?: string;
}

export function StatCard({ tone, icon: Icon, value, label, hint }: StatCardProps) {
  return (
    <Card $tone={tone}>
      <IconTile $tone={tone} aria-hidden="true">
        <Icon size={20} />
      </IconTile>
      <Value>{value}</Value>
      <Label>{label}</Label>
      {hint && <Hint $tone={tone}>{hint}</Hint>}
    </Card>
  );
}

/** Count-up currency; isolated so only this text re-renders per animation frame. */
export function AnimatedCurrency({ value }: { value: number }) {
  const animated = useAnimatedNumber(value, { fromZero: true });
  return <>{formatCurrencyBRL(animated)}</>;
}

export function AnimatedCount({ value }: { value: number }) {
  return <>{useAnimatedNumber(value, { fromZero: true })}</>;
}
