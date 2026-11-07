import styled, { css } from 'styled-components';
import { fadeInUp, popIn, shake, shimmer } from '@/styles/animations';
import { cardSurface, onHover, pressable, visuallyHidden } from '@/styles/mixins';

export const Screen = styled.main`
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: calc(24px + env(safe-area-inset-top)) ${({ theme }) => theme.layout.gutter}
    calc(24px + env(safe-area-inset-bottom));
  animation: ${fadeInUp} 420ms ${({ theme }) => theme.motion.easeOut} both;
`;

export const ScreenCard = styled.section`
  ${cardSurface}
  width: 100%;
  padding: 28px 20px 20px;
`;

export const Panel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
`;

export const Shield = styled.span<{ $success: boolean }>`
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme, $success }) => ($success ? theme.colors.primary : theme.colors.primarySoft)};
  color: ${({ theme, $success }) => ($success ? theme.colors.onPrimary : theme.colors.primary)};
  transition:
    background-color ${({ theme }) => theme.motion.base} ease,
    color ${({ theme }) => theme.motion.base} ease;

  ${({ $success }) =>
    $success &&
    css`
      animation: ${popIn} 520ms ${({ theme }) => theme.motion.easeOut} both;
    `}
`;

export const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  letter-spacing: -0.03em;
`;

export const Instruction = styled.p`
  max-width: 32ch;
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: ${({ theme }) => theme.lineHeights.normal};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Target = styled.strong`
  display: inline-block;
  padding: 1px 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
`;

export const Grid = styled.div<{ $shake: boolean }>`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
  max-width: 330px;
  margin-top: 4px;

  ${({ $shake }) =>
    $shake &&
    css`
      animation: ${shake} 420ms ${({ theme }) => theme.motion.easeInOut};
    `}
`;

type OptionState = 'idle' | 'pending' | 'right' | 'wrong';

const optionStates: Record<OptionState, ReturnType<typeof css>> = {
  idle: css``,
  pending: css`
    border-color: ${({ theme }) => theme.colors.primary};
  `,
  right: css`
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primarySoft};
    color: ${({ theme }) => theme.colors.primary};
  `,
  wrong: css`
    border-color: ${({ theme }) => theme.colors.danger};
    background: ${({ theme }) => theme.colors.dangerSoft};
    color: ${({ theme }) => theme.colors.danger};
  `,
};

export const Option = styled.button<{ $state: OptionState }>`
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.textPrimary};
  animation: ${fadeInUp} 320ms ${({ theme }) => theme.motion.easeOut} both;
  transition:
    border-color ${({ theme }) => theme.motion.fast} ease,
    background-color ${({ theme }) => theme.motion.fast} ease,
    color ${({ theme }) => theme.motion.fast} ease;
  ${pressable(0.92)}
  ${({ $state }) => optionStates[$state]}

  ${onHover(css`
    border-color: ${({ theme }) => theme.colors.borderStrong};
  `)}

  &:disabled {
    cursor: default;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 2px;
  }
`;

export const Placeholder = styled.span`
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.skeleton};

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, ${({ theme }) => theme.colors.skeletonShine}, transparent);
    transform: translateX(-100%);
    animation: ${shimmer} 1.4s linear infinite;
  }
`;

export const ErrorBox = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 10px;
  text-align: left;
`;

export const Footer = styled.div`
  display: flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
`;

export const Miss = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.danger};
`;

export const Note = styled.p`
  max-width: 36ch;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textTertiary};
`;

export const LiveRegion = styled.span`
  ${visuallyHidden}
`;
