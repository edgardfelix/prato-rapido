import { keyframes } from 'styled-components';

/* Every animation only touches transform/opacity so it stays on the compositor (60fps). */

export const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

export const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const slideInFromRight = keyframes`
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: translateX(0); }
`;

export const slideInFromLeft = keyframes`
  from { opacity: 0; transform: translateX(-24px); }
  to { opacity: 1; transform: translateX(0); }
`;

export const sheetIn = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

export const sheetOut = keyframes`
  from { transform: translateY(0); }
  to { transform: translateY(100%); }
`;

export const shimmer = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
`;

export const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const pulseRing = keyframes`
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(1.55); opacity: 0; }
`;

export const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.25; }
`;

export const scanLine = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`;

export const popIn = keyframes`
  0% { transform: scale(0.6); opacity: 0; }
  60% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

/** "+R$ 15" style reward that floats away. */
export const floatUp = keyframes`
  0% { opacity: 0; transform: translateY(6px) scale(0.92); }
  18% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-34px) scale(1); }
`;

/** Horizontal drift for the water surface (the element is 200% wide). */
export const waveDrift = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

export const toastIn = keyframes`
  from { opacity: 0; transform: translateY(-14px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

/** Bottom snackbar (auto-save confirmations). */
export const snackbarIn = keyframes`
  from { opacity: 0; transform: translateY(12px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

export const snackbarOut = keyframes`
  from { opacity: 1; transform: translateY(0) scale(1); }
  to { opacity: 0; transform: translateY(8px) scale(0.98); }
`;

export const overlayIn = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`;

/** "No" shake for a wrong answer (horizontal only). */
export const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-7px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(2px); }
`;

/* Celebration modal: springy entrance, a "haptic" medal bounce and a soft exit. */
export const celebrationIn = keyframes`
  0% { opacity: 0; transform: translateY(28px) scale(0.86); }
  60% { opacity: 1; transform: translateY(-4px) scale(1.02); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
`;

export const celebrationOut = keyframes`
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.94); }
`;

export const medalPop = keyframes`
  0% { transform: scale(0.3) rotate(-14deg); opacity: 0; }
  45% { transform: scale(1.16) rotate(6deg); opacity: 1; }
  65% { transform: scale(0.94) rotate(-3deg); }
  82% { transform: scale(1.04) rotate(1deg); }
  100% { transform: scale(1) rotate(0); }
`;

export const glowPulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.55; }
  50% { transform: scale(1.12); opacity: 0.9; }
`;

/* Route transitions (applied with fill-mode "backwards", so no transform stays behind). */
export const screenInForward = keyframes`
  from { opacity: 0; transform: translateX(18px); }
  to { opacity: 1; transform: translateX(0); }
`;

export const screenInBack = keyframes`
  from { opacity: 0; transform: translateX(-18px); }
  to { opacity: 1; transform: translateX(0); }
`;
