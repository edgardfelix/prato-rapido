import styled, { css } from 'styled-components';
import { onHover, pressable } from '@/styles/mixins';

export const Root = styled.button<{ $selected: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: 0;
  min-height: 132px;
  padding: 14px 12px;
  text-align: left;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme, $selected }) => ($selected ? theme.colors.primarySoft : theme.colors.surface)};
  border: 1.5px solid ${({ theme, $selected }) => ($selected ? theme.colors.primaryBorder : theme.colors.border)};
  box-shadow: ${({ theme }) => theme.shadows.card};
  ${pressable(0.96)}

  ${onHover(css`
    border-color: ${({ theme }) => theme.colors.borderStrong};
  `)}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 2px;
  }
`;

export const IconTile = styled.span<{ $selected: boolean }>`
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  margin-bottom: 6px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme, $selected }) => ($selected ? theme.colors.primary : theme.colors.surfaceRaised)};
  color: ${({ theme, $selected }) => ($selected ? theme.colors.onPrimary : theme.colors.primary)};
  transition:
    background-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut},
    color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut};
`;

export const Title = styled.span`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: ${({ theme }) => theme.lineHeights.snug};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Description = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  line-height: ${({ theme }) => theme.lineHeights.snug};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const CheckBadge = styled.span<{ $visible: boolean }>`
  position: absolute;
  top: 10px;
  right: 10px;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: scale(${({ $visible }) => ($visible ? 1 : 0.4)});
  transition:
    transform ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut},
    opacity ${({ theme }) => theme.motion.fast} linear;
`;
