import styled, { css } from 'styled-components';
import { cardSurface, visuallyHidden } from '@/styles/mixins';

export const Card = styled.section`
  ${cardSurface}
  padding: 20px;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

export const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

export const Count = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.primary};
`;

export const List = styled.ol`
  display: flex;
  flex-direction: column;
`;

export const Item = styled.li<{ $isLast: boolean }>`
  position: relative;

  ${({ $isLast, theme }) =>
    !$isLast &&
    css`
      &::before {
        content: '';
        position: absolute;
        top: 48px;
        bottom: -6px;
        left: 17px;
        width: 2px;
        border-radius: 2px;
        background: ${theme.colors.border};
      }
    `}
`;

export const StepButton = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  width: 100%;
  padding: 10px 0;
  text-align: left;
  -webkit-tap-highlight-color: transparent;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 2px;
    border-radius: ${({ theme }) => theme.radii.sm};
  }
`;

export const StepNumber = styled.span<{ $done: boolean }>`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  background: ${({ theme, $done }) => ($done ? theme.colors.primary : theme.colors.primarySoft)};
  color: ${({ theme, $done }) => ($done ? theme.colors.onPrimary : theme.colors.primary)};
  transition:
    background-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut},
    color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut},
    transform ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.motion.easeOut};

  button:active & {
    transform: scale(0.9);
  }
`;

export const StepText = styled.span<{ $done: boolean }>`
  padding-top: 6px;
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: 1.55;
  color: ${({ theme, $done }) => ($done ? theme.colors.textTertiary : theme.colors.textPrimary)};
  transition: color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut};
`;

export const VisuallyHidden = styled.span`
  ${visuallyHidden}
`;

export const Hint = styled.p`
  margin-top: 8px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textTertiary};
`;
