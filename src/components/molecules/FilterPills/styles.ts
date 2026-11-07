import styled from 'styled-components';
import { visuallyHidden } from '@/styles/mixins';

export const Root = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const Pill = styled.label<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 14px;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 1.5px solid ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.surface)};
  color: ${({ theme, $active }) => ($active ? theme.colors.onPrimary : theme.colors.textPrimary)};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  transition:
    transform ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.motion.easeOut},
    background-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut},
    border-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut},
    color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut};

  &:active {
    transform: scale(0.95);
  }

  &:has(input:focus-visible) {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 2px;
  }
`;

export const Input = styled.input`
  ${visuallyHidden}
`;
