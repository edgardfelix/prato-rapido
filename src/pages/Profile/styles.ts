import styled from 'styled-components';
import type { CelebrationTone } from '@/constants/journey';
import { cardSurface, pressable } from '@/styles/mixins';
import { toneColors } from '@/styles/tones';

export const ProfileCard = styled.section`
  ${cardSurface}
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
`;

export const ProfileRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

/** Recipes, streak and savings at a glance (label under the number, read label-first). */
export const Stats = styled.dl`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding-top: 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export const Stat = styled.div<{ $tone?: CelebrationTone }>`
  display: flex;
  min-width: 0;
  flex-direction: column-reverse;
  align-items: center;
  gap: 2px;
  padding: 0 4px;
  text-align: center;

  & + & {
    border-left: 1px solid ${({ theme }) => theme.colors.border};
  }

  dd {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: ${({ theme }) => theme.fontSizes.lg};
    font-weight: ${({ theme }) => theme.fontWeights.extrabold};
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    color: ${({ theme, $tone }) => ($tone ? toneColors(theme, $tone).color : theme.colors.textPrimary)};
  }

  dt {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const AvatarButton = styled.button`
  position: relative;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radii.full};
  ${pressable(0.94)}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 3px;
  }
`;

export const AvatarEditBadge = styled.span`
  position: absolute;
  right: -2px;
  bottom: -2px;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.surface};
`;

export const Identity = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
`;

export const Name = styled.h1`
  overflow: hidden;
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const Email = styled.p`
  overflow: hidden;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  white-space: nowrap;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Meta = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textTertiary};
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const SectionHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  h2 {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const TileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const FieldLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

export const Hint = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: ${({ theme }) => theme.lineHeights.snug};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/** One setting: icon, label + explanation, and its control. */
export const SettingRow = styled.div`
  ${cardSurface}
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
`;

export const SettingIcon = styled.span<{ $active: boolean }>`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme, $active }) => ($active ? theme.colors.primarySoft : theme.colors.surfaceRaised)};
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.textTertiary)};
`;

export const SettingTexts = styled.span`
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
  text-align: left;

  strong {
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    line-height: ${({ theme }) => theme.lineHeights.snug};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

/** Destructive entry point: a card (the long label wraps), opening a confirmation sheet. */
export const DangerAction = styled.button`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1.5px solid color-mix(in srgb, ${({ theme }) => theme.colors.danger} 40%, transparent);
  background: ${({ theme }) => theme.colors.dangerSoft};
  color: ${({ theme }) => theme.colors.danger};
  ${pressable(0.98)}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 2px;
  }
`;

export const DangerIcon = styled.span`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.onDanger};
`;

export const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;
