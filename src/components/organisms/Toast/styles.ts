import styled, { css } from 'styled-components';
import { popIn, snackbarIn, snackbarOut, toastIn } from '@/styles/animations';

type Placement = 'bottom' | 'top';

export const Positioner = styled.div<{ $placement: Placement }>`
  position: fixed;
  right: 0;
  left: 0;
  ${({ $placement, theme }) =>
    $placement === 'top'
      ? css`
          top: calc(12px + env(safe-area-inset-top));
        `
      : css`
          bottom: calc(${theme.layout.bottomNavSpace} + 12px);
        `}
  z-index: ${({ theme }) => theme.zIndex.toast};
  display: flex;
  justify-content: center;
  padding: 0 16px;
  pointer-events: none;
`;

/* Inverted colors (light pill on dark, dark pill on light) read well over any content. */
export const Pill = styled.div<{ $leaving: boolean; $placement: Placement }>`
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: min(100%, 420px);
  padding: 8px 18px 8px 8px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.textPrimary};
  color: ${({ theme }) => theme.colors.background};
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28);
  ${({ $leaving, $placement, theme }) =>
    $leaving
      ? css`
          animation: ${snackbarOut} 180ms ${theme.motion.easeInOut} both;
        `
      : css`
          animation: ${$placement === 'top' ? toastIn : snackbarIn} 280ms ${theme.motion.easeOut} both;
        `}
`;

export const IconBadge = styled.span<{ $tone: 'success' | 'error' }>`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme, $tone }) => ($tone === 'error' ? theme.colors.danger : theme.colors.primary)};
  color: ${({ theme, $tone }) => ($tone === 'error' ? theme.colors.onDanger : theme.colors.onPrimary)};
  animation: ${popIn} 420ms ${({ theme }) => theme.motion.easeOut} both;
`;

export const Texts = styled.span`
  display: flex;
  min-width: 0;
  flex-direction: column;
  line-height: 1.25;

  strong {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    opacity: 0.72;
  }
`;
