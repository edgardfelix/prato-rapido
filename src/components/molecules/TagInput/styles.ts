import styled, { css } from 'styled-components';
import { onHover, pressable } from '@/styles/mixins';

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

export const Field = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 4px 4px 16px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition:
    border-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut},
    box-shadow ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut};

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primaryBorder};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.primarySoft};
  }
`;

export const Input = styled.input`
  flex: 1;
  min-width: 0;
  height: 40px;
  border: 0;
  background: transparent;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textPrimary};
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textTertiary};
  }
`;

export const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const Suggestions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const Suggestion = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 0 12px;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 1px dashed ${({ theme }) => theme.colors.borderStrong};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  ${pressable(0.94)}

  ${onHover(css`
    color: ${({ theme }) => theme.colors.textPrimary};
    border-color: ${({ theme }) => theme.colors.primaryBorder};
  `)}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
  }
`;

export const Hint = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textTertiary};
`;
