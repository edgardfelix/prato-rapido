import styled, { css } from 'styled-components';
import { onHover, visuallyHidden } from '@/styles/mixins';

export const Root = styled.label<{ $checked: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 76px;
  padding: 14px 16px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme, $checked }) => ($checked ? theme.colors.primarySoft : theme.colors.surface)};
  border: 1.5px solid ${({ theme, $checked }) => ($checked ? theme.colors.primaryBorder : theme.colors.border)};
  box-shadow: ${({ theme }) => theme.shadows.card};
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  transition:
    transform ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.motion.easeOut},
    background-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut},
    border-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut};

  &:active {
    transform: scale(0.98);
  }

  &:has(input:focus-visible) {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 2px;
  }

  ${onHover(css`
    border-color: ${({ theme }) => theme.colors.borderStrong};
  `)}
`;

export const HiddenInput = styled.input`
  ${visuallyHidden}
`;

export const IconTile = styled.span<{ $checked: boolean }>`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.md};
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
  gap: 2px;
`;

export const Title = styled.span`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Description = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Indicator = styled.span<{ $type: 'radio' | 'checkbox'; $checked: boolean }>`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: ${({ theme, $type }) => ($type === 'radio' ? theme.radii.full : '8px')};
  border: 2px solid ${({ theme, $checked }) => ($checked ? theme.colors.primary : theme.colors.borderStrong)};
  background: ${({ theme, $checked }) => ($checked ? theme.colors.primary : 'transparent')};
  color: ${({ theme }) => theme.colors.onPrimary};
  transition:
    background-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut},
    border-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut};

  svg {
    opacity: ${({ $checked }) => ($checked ? 1 : 0)};
    transform: scale(${({ $checked }) => ($checked ? 1 : 0.5)});
    transition:
      transform ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut},
      opacity ${({ theme }) => theme.motion.fast} linear;
  }
`;
