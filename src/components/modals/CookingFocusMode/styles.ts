import styled from 'styled-components';
import { overlayIn } from '@/styles/animations';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.zIndex.cookingMode};
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  padding: env(safe-area-inset-top) 0 calc(16px + env(safe-area-inset-bottom));
  background: ${({ theme }) => theme.colors.background};
  outline: none;
  animation: ${overlayIn} 320ms ${({ theme }) => theme.motion.easeOut} both;

  @media (min-width: 521px) {
    border-inline: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 8px;
`;

export const Counter = styled.span`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-variant-numeric: tabular-nums;
`;

export const Progress = styled.div`
  display: flex;
  gap: 6px;
  padding: 0 20px;
`;

export const Segment = styled.span<{ $filled: boolean }>`
  position: relative;
  flex: 1;
  height: 5px;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.surfaceRaised};

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: ${({ theme }) => theme.colors.primary};
    transform-origin: left center;
    transform: scaleX(${({ $filled }) => ($filled ? 1 : 0)});
    transition: transform ${({ theme }) => theme.motion.slow} ${({ theme }) => theme.motion.easeOut};
  }
`;

export const RecipeName = styled.p`
  overflow: hidden;
  padding: 14px 24px 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  white-space: nowrap;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/** Horizontal gestures are handled in JS; vertical panning scrolls long steps natively. */
export const Viewport = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  touch-action: pan-y;
`;

export const Track = styled.div`
  display: flex;
  height: 100%;
  transform: translateX(calc(var(--index) * -100% + var(--drag, 0px)));
  transition: transform 340ms ${({ theme }) => theme.motion.easeOut};
  will-change: transform;

  &[data-dragging='true'] {
    transition: none;
    user-select: none;
  }
`;

export const Card = styled.article<{ $active: boolean }>`
  display: flex;
  flex: 0 0 100%;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
  min-width: 0;
  padding: 16px 28px;
  overflow-y: auto;
  /* A scroll container resets touch-action, so the card must opt in too. */
  touch-action: pan-y;
  opacity: ${({ $active }) => ($active ? 1 : 0.3)};
  transform: scale(${({ $active }) => ($active ? 1 : 0.94)});
  transition:
    opacity ${({ theme }) => theme.motion.slow} ${({ theme }) => theme.motion.easeOut},
    transform ${({ theme }) => theme.motion.slow} ${({ theme }) => theme.motion.easeOut};
`;

export const StepNumber = styled.span`
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.5rem;
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
`;

export const StepText = styled.p`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(1.55rem, 6.4vw, 2.15rem);
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  line-height: 1.36;
  letter-spacing: -0.015em;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const WakeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 20px 12px;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const WakeIcon = styled.span<{ $active: boolean }>`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme, $active }) => ($active ? theme.colors.goldSoft : theme.colors.surfaceRaised)};
  color: ${({ theme, $active }) => ($active ? theme.colors.gold : theme.colors.textTertiary)};
  transition:
    background-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut},
    color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut};
`;

export const WakeTexts = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;

  strong {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const BottomBar = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 10px;
  padding: 0 20px;
`;

export const Ingredients = styled.ul`
  display: flex;
  flex-direction: column;

  li {
    padding: 12px 0;
    font-size: ${({ theme }) => theme.fontSizes.lg};
    line-height: 1.4;
  }

  li + li {
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }
`;
