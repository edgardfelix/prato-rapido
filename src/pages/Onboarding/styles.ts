import styled, { css } from 'styled-components';
import { slideInFromLeft, slideInFromRight } from '@/styles/animations';
import { visuallyHidden } from '@/styles/mixins';

export const Form = styled.form`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

export const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 24px;
  padding: 16px ${({ theme }) => theme.layout.gutter} 24px;
`;

export const StepViewport = styled.div<{ $direction: 'forward' | 'backward' }>`
  ${({ $direction, theme }) => css`
    animation: ${$direction === 'forward' ? slideInFromRight : slideInFromLeft} ${theme.motion.slow} ${theme.motion.easeOut} both;
  `}
`;

export const StepBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const Hero = styled.div`
  display: flex;
  justify-content: center;
  padding: 4px 0 0;
`;

export const Heading = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  letter-spacing: -0.03em;
`;

export const Intro = styled.p`
  margin-top: -10px;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const PrivacyNote = styled.p`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};

  svg {
    flex-shrink: 0;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Fieldset = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  padding: 0;
  border: 0;
`;

export const Legend = styled.legend`
  ${visuallyHidden}
`;

export const Footer = styled.div`
  position: sticky;
  bottom: 0;
  z-index: ${({ theme }) => theme.zIndex.header};
  padding: 12px ${({ theme }) => theme.layout.gutter} calc(16px + env(safe-area-inset-bottom));
  background: linear-gradient(to top, ${({ theme }) => theme.colors.background} 75%, transparent);
`;
