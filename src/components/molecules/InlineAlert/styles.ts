import styled from 'styled-components';
import type { DefaultTheme } from 'styled-components';
import { fadeInUp } from '@/styles/animations';
import type { AlertTone } from '.';

const toneColors = (theme: DefaultTheme, tone: AlertTone) => {
  switch (tone) {
    case 'error':
      return { background: theme.colors.dangerSoft, accent: theme.colors.danger };
    case 'warning':
      return { background: theme.colors.warningSoft, accent: theme.colors.warning };
    case 'success':
      return { background: theme.colors.primarySoft, accent: theme.colors.primary };
    case 'info':
    default:
      return { background: theme.colors.surfaceRaised, accent: theme.colors.primary };
  }
};

export const Root = styled.div<{ $tone: AlertTone }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 14px 14px 16px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme, $tone }) => toneColors(theme, $tone).background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  animation: ${fadeInUp} ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut};
`;

export const IconSlot = styled.span<{ $tone: AlertTone }>`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  margin-top: 1px;
  color: ${({ theme, $tone }) => toneColors(theme, $tone).accent};
`;

export const Body = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
`;

export const Title = styled.strong`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Text = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: ${({ theme }) => theme.lineHeights.normal};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Action = styled.div`
  margin-top: 8px;
`;

export const Dismiss = styled.button`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  margin: -4px -4px 0 0;
  border-radius: ${({ theme }) => theme.radii.full};
  color: ${({ theme }) => theme.colors.textSecondary};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
  }
`;
