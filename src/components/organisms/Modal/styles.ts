import styled, { css } from 'styled-components';
import { fadeIn, fadeOut, sheetIn, sheetOut } from '@/styles/animations';

type SheetState = 'open' | 'closed';

export const Backdrop = styled.div<{ $state: SheetState }>`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.zIndex.overlay};
  background: ${({ theme }) => theme.colors.overlay};
  animation: ${({ $state }) =>
    $state === 'open'
      ? css`
          ${fadeIn} 220ms ease-out both
        `
      : css`
          ${fadeOut} 200ms ease-in both
        `};
`;

export const Positioner = styled.div`
  position: fixed;
  inset: auto 0 0 0;
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: flex;
  justify-content: center;
  pointer-events: none;
`;

export const Sheet = styled.div<{ $state: SheetState }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  max-height: 88vh;
  max-height: 88dvh;
  padding: 8px 20px calc(24px + env(safe-area-inset-bottom));
  overflow-y: auto;
  overscroll-behavior: contain;
  pointer-events: auto;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 0;
  border-radius: ${({ theme }) => theme.radii.xl} ${({ theme }) => theme.radii.xl} 0 0;
  box-shadow: ${({ theme }) => theme.shadows.raised};
  outline: none;
  will-change: transform;
  animation: ${({ $state, theme }) =>
    $state === 'open'
      ? css`
          ${sheetIn} 320ms ${theme.motion.easeOut} both
        `
      : css`
          ${sheetOut} 220ms ${theme.motion.easeInOut} both
        `};
`;

export const Handle = styled.span`
  align-self: center;
  width: 40px;
  height: 4px;
  margin-bottom: 12px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.borderStrong};
`;

export const SheetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

export const Description = styled.p`
  margin-top: 4px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Body = styled.div`
  margin-top: 20px;
`;
