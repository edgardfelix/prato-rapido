import styled, { css } from 'styled-components';
import type { CelebrationTone } from '@/constants/journey';
import {
  celebrationIn,
  celebrationOut,
  fadeIn,
  fadeInUp,
  fadeOut,
  glowPulse,
  medalPop,
  pulseRing,
} from '@/styles/animations';
import { toneColors } from '@/styles/tones';

const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

export const Overlay = styled.div<{ $closing: boolean }>`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.zIndex.celebration};
  display: grid;
  place-items: center;
  padding: calc(16px + env(safe-area-inset-top)) 16px calc(16px + env(safe-area-inset-bottom));
  animation: ${({ $closing }) => ($closing ? fadeOut : fadeIn)} ${({ $closing }) => ($closing ? '200ms' : '260ms')} ease both;
`;

export const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlay};
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
`;

export const Card = styled.div<{ $closing: boolean }>`
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  max-width: 400px;
  max-height: 100%;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  padding: 36px 24px 24px;
  text-align: center;
  border-radius: 28px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
  outline: none;
  animation: ${({ $closing }) =>
    $closing
      ? css`
          ${celebrationOut} 200ms ease both
        `
      : css`
          ${celebrationIn} 560ms ${SPRING} both
        `};
`;

export const Medal = styled.div<{ $tone: CelebrationTone }>`
  position: relative;
  display: grid;
  place-items: center;
  width: 104px;
  height: 104px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme, $tone }) => toneColors(theme, $tone).soft};
  color: ${({ theme, $tone }) => toneColors(theme, $tone).color};
  animation: ${medalPop} 760ms ${({ theme }) => theme.motion.easeOut} 120ms both;

  svg {
    position: relative;
  }
`;

/** Soft halo behind the medal. */
export const Glow = styled.span<{ $tone: CelebrationTone }>`
  position: absolute;
  inset: -18px;
  border-radius: inherit;
  background: radial-gradient(circle, ${({ theme, $tone }) => toneColors(theme, $tone).soft} 0%, transparent 70%);
  animation: ${glowPulse} 2.4s ease-in-out infinite;
  pointer-events: none;
`;

export const Ring = styled.span<{ $tone: CelebrationTone }>`
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 2px solid ${({ theme, $tone }) => toneColors(theme, $tone).color};
  animation: ${pulseRing} 1.8s ${({ theme }) => theme.motion.easeOut} 500ms infinite;
  pointer-events: none;
`;

const rise = (delayMs: number) => css`
  animation: ${fadeInUp} 440ms ${({ theme }) => theme.motion.easeOut} ${delayMs}ms both;
`;

export const Eyebrow = styled.p<{ $tone: CelebrationTone }>`
  margin-top: 22px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme, $tone }) => toneColors(theme, $tone).color};
  ${rise(220)}
`;

export const Title = styled.h2`
  margin-top: 8px;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(1.65rem, 7.2vw, 2.1rem);
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  line-height: 1.08;
  letter-spacing: -0.035em;
  text-wrap: balance;
  ${rise(270)}
`;

export const Description = styled.p`
  max-width: 32ch;
  margin-top: 10px;
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: ${({ theme }) => theme.lineHeights.normal};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-wrap: pretty;
  ${rise(330)}
`;

export const Extras = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  ${rise(390)}
`;

export const ExtrasLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.textTertiary};
`;

export const ExtrasList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
`;

export const ExtraChip = styled.span<{ $tone: CelebrationTone }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme, $tone }) => toneColors(theme, $tone).soft};
  color: ${({ theme, $tone }) => toneColors(theme, $tone).color};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

export const Actions = styled.div`
  width: 100%;
  margin-top: 26px;
  ${rise(440)}
`;

export const ConfettiCanvas = styled.canvas`
  position: fixed;
  inset: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;
