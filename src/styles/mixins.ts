import { css, type RuleSet } from 'styled-components';

/** Tactile press feedback shared by every tappable element. */
export const pressable = (scale = 0.96) => css`
  transition:
    transform ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.motion.easeOut},
    background-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut},
    border-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut},
    color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut},
    box-shadow ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut},
    opacity ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut};
  -webkit-tap-highlight-color: transparent;
  user-select: none;

  &:active:not(:disabled) {
    transform: scale(${scale});
  }
`;

/** Hover styles only for devices with a real pointer (avoids sticky hover on touch). */
export const onHover = (styles: RuleSet<object>) => css`
  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled) {
      ${styles}
    }
  }
`;

/** Hides content visually while keeping it available to assistive technology. */
export const visuallyHidden = css`
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
`;

/** The single card surface used across the app. */
export const cardSurface = css`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;
