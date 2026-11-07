import styled from 'styled-components';
import { visuallyHidden } from '@/styles/mixins';

export const Root = styled.label<{ $checked: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 60px;
  padding: 10px 12px;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme, $checked }) => ($checked ? theme.colors.primarySoft : theme.colors.surface)};
  border: 1.5px solid ${({ theme, $checked }) => ($checked ? theme.colors.primaryBorder : theme.colors.border)};
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  transition:
    transform ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.motion.easeOut},
    background-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut},
    border-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut};

  &:active {
    transform: scale(0.97);
  }

  &:has(input:focus-visible) {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 2px;
  }
`;

export const Input = styled.input`
  ${visuallyHidden}
`;

export const IconTile = styled.span<{ $checked: boolean }>`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme, $checked }) => ($checked ? theme.colors.primary : theme.colors.surfaceRaised)};
  color: ${({ theme, $checked }) => ($checked ? theme.colors.onPrimary : theme.colors.textSecondary)};
  transition:
    background-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut},
    color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut};
`;

export const Texts = styled.span`
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
`;

export const Label = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Description = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/* Corner badge: takes no horizontal space, so labels like "Micro-ondas" fit on one line. */
export const CheckMark = styled.span<{ $checked: boolean }>`
  position: absolute;
  top: -6px;
  right: -6px;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  opacity: ${({ $checked }) => ($checked ? 1 : 0)};
  transform: scale(${({ $checked }) => ($checked ? 1 : 0.4)});
  transition:
    transform ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut},
    opacity ${({ theme }) => theme.motion.fast} linear;
`;
