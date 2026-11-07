import styled, { css } from 'styled-components';
import { onHover, pressable } from '@/styles/mixins';
import type { IconButtonSize, IconButtonVariant } from '.';

const dimensions: Record<IconButtonSize, string> = { sm: '36px', md: '44px', lg: '56px' };

const variants: Record<IconButtonVariant, ReturnType<typeof css>> = {
  surface: css`
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
  primary: css`
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.onPrimary};

    ${onHover(css`
      background: ${({ theme }) => theme.colors.primaryHover};
    `)}
  `,
  danger: css`
    background: ${({ theme }) => theme.colors.dangerSoft};
    color: ${({ theme }) => theme.colors.danger};
  `,
};

export const Root = styled.button<{ $variant: IconButtonVariant; $size: IconButtonSize }>`
  position: relative;
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: ${({ $size }) => dimensions[$size]};
  height: ${({ $size }) => dimensions[$size]};
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.radii.full};
  ${pressable(0.92)}
  ${({ $variant }) => variants[$variant]}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.4;
  }
`;
