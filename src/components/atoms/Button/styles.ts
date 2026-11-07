import styled, { css } from 'styled-components';
import { onHover, pressable } from '@/styles/mixins';
import type { ButtonSize, ButtonVariant } from '.';

interface RootProps {
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
}

const sizes: Record<ButtonSize, ReturnType<typeof css>> = {
  sm: css`
    height: 36px;
    padding: 0 14px;
    gap: 6px;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  `,
  md: css`
    height: 48px;
    padding: 0 20px;
    gap: 8px;
    font-size: ${({ theme }) => theme.fontSizes.md};
  `,
  lg: css`
    height: 56px;
    padding: 0 24px;
    gap: 10px;
    font-size: 1.0625rem;
  `,
};

const variants: Record<ButtonVariant, ReturnType<typeof css>> = {
  primary: css`
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.onPrimary};
    box-shadow: ${({ theme }) => theme.shadows.primary};

    ${onHover(css`
      background: ${({ theme }) => theme.colors.primaryHover};
    `)}

    &:active:not(:disabled) {
      background: ${({ theme }) => theme.colors.primaryPressed};
    }
  `,
  secondary: css`
    background: ${({ theme }) => theme.colors.surfaceRaised};
    color: ${({ theme }) => theme.colors.textPrimary};
    border-color: ${({ theme }) => theme.colors.border};

    ${onHover(css`
      background: ${({ theme }) => theme.colors.surfaceHover};
    `)}
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.textSecondary};

    ${onHover(css`
      background: ${({ theme }) => theme.colors.surfaceRaised};
      color: ${({ theme }) => theme.colors.textPrimary};
    `)}
  `,
  danger: css`
    background: ${({ theme }) => theme.colors.dangerSoft};
    color: ${({ theme }) => theme.colors.danger};

    ${onHover(css`
      background: ${({ theme }) => theme.colors.danger};
      color: ${({ theme }) => theme.colors.onDanger};
    `)}
  `,
};

export const Root = styled.button<RootProps>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.radii.full};
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: -0.01em;
  white-space: nowrap;
  ${pressable(0.96)}
  ${({ $size }) => sizes[$size]}
  ${({ $variant }) => variants[$variant]}

  svg {
    flex-shrink: 0;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 3px;
  }

  &:disabled {
    opacity: 0.45;
    box-shadow: none;
  }

  &[aria-busy='true'] {
    opacity: 1;
    cursor: progress;
  }
`;
