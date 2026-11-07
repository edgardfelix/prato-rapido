import styled, { css } from 'styled-components';
import { fadeIn } from '@/styles/animations';
import { onHover, pressable } from '@/styles/mixins';

export const Root = styled.button<{ $selected: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 14px;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 1.5px solid ${({ theme, $selected }) => ($selected ? theme.colors.primaryBorder : theme.colors.border)};
  background: ${({ theme, $selected }) => ($selected ? theme.colors.primarySoft : theme.colors.surface)};
  color: ${({ theme, $selected }) => ($selected ? theme.colors.primary : theme.colors.textPrimary)};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  white-space: nowrap;
  ${pressable(0.95)}

  ${onHover(css`
    border-color: ${({ theme }) => theme.colors.borderStrong};
  `)}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 2px;
  }
`;

export const Removable = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  height: 36px;
  padding: 0 4px 0 14px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.dangerSoft};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  animation: ${fadeIn} ${({ theme }) => theme.motion.base} ease-out;
`;

export const RemoveButton = styled.button`
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: ${({ theme }) => theme.radii.full};
  color: ${({ theme }) => theme.colors.danger};
  ${pressable(0.88)}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
  }
`;
