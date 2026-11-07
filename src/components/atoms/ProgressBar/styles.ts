import styled from 'styled-components';
import type { CelebrationTone } from '@/constants/journey';
import { toneColors } from '@/styles/tones';

export const Track = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.surfaceRaised};
`;

export const Fill = styled.span<{ $tone: CelebrationTone }>`
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: ${({ theme, $tone }) => toneColors(theme, $tone).color};
  transform-origin: left center;
  transition: transform 600ms ${({ theme }) => theme.motion.easeOut};
`;
