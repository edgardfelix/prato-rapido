import { Link } from 'react-router';
import styled, { css } from 'styled-components';
import { pulseRing } from '@/styles/animations';

/** Fixed frame around the floating capsule; only the capsule itself receives taps. */
export const Bar = styled.nav<{ $hidden: boolean }>`
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: ${({ theme }) => theme.zIndex.bottomNav};
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  padding: 0 12px calc(${({ theme }) => theme.layout.bottomNavOffset} + env(safe-area-inset-bottom));
  pointer-events: none;

  /* Hidden = moved off-screen (compositor-only) and out of the tab order once it is gone. */
  ${({ $hidden, theme }) =>
    $hidden
      ? css`
          visibility: hidden;
          transform: translateY(calc(100% + 32px));
          transition:
            transform ${theme.motion.slow} ${theme.motion.easeOut},
            visibility 0s linear ${theme.motion.slow};
        `
      : css`
          visibility: visible;
          transform: translateY(0);
          transition: transform ${theme.motion.slow} ${theme.motion.easeOut};
        `}
`;

/** Glassmorphism: translucent fill + backdrop blur; an opaque surface where blur is unsupported. */
export const Glass = styled.div`
  position: relative;
  height: ${({ theme }) => theme.layout.bottomNavHeight};
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.colors.glassBorder};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.colors.glassShadow};
  pointer-events: auto;

  @supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
    background: ${({ theme }) => theme.colors.glass};
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    backdrop-filter: saturate(180%) blur(20px);
  }
`;

/** One tab wide; glides to the active tab with a slight spring. */
export const Lens = styled.span`
  position: absolute;
  top: 6px;
  bottom: 6px;
  left: 0;
  width: 25%;
  transform: translateX(calc(var(--active) * 100%));
  transition: transform 420ms cubic-bezier(0.34, 1.32, 0.64, 1);
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    inset: 0 6px;
    border-radius: 18px;
    background: ${({ theme }) => theme.colors.primarySoft};
    box-shadow: inset 0 0 0 1px color-mix(in srgb, ${({ theme }) => theme.colors.primary} 24%, transparent);
  }
`;

export const List = styled.ul`
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  height: 100%;
`;

export const Item = styled(Link)<{ $active: boolean }>`
  position: relative;
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  text-decoration: none;
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.textSecondary)};
  -webkit-tap-highlight-color: transparent;
  transition: color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: -6px;
    border-radius: 18px;
  }
`;

export const IconWrap = styled.span<{ $active: boolean }>`
  position: relative;
  display: grid;
  place-items: center;
  transform: scale(${({ $active }) => ($active ? 1.08 : 1)});
  transition: transform ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut};

  a:active & {
    transform: scale(0.88);
  }
`;

export const Dot = styled.span`
  position: absolute;
  top: -3px;
  right: -6px;
  width: 9px;
  height: 9px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.streak};
  box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.surface};

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: ${({ theme }) => theme.colors.streak};
    animation: ${pulseRing} 2s ${({ theme }) => theme.motion.easeOut} infinite;
  }
`;

export const Label = styled.span`
  font-size: 0.6875rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  letter-spacing: 0.01em;
`;
