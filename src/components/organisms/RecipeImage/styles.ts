import styled from 'styled-components';
import { fadeIn } from '@/styles/animations';

export const Frame = styled.div`
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.skeleton};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const Placeholder = styled.div`
  position: absolute;
  inset: 0;
`;

export const PlaceholderLabel = styled.span`
  position: absolute;
  inset: auto 0 16px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Image = styled.img<{ $visible: boolean }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: scale(${({ $visible }) => ($visible ? 1 : 1.03)});
  transition:
    opacity ${({ theme }) => theme.motion.slow} ${({ theme }) => theme.motion.easeOut},
    transform 600ms ${({ theme }) => theme.motion.easeOut};
`;

export const Fallback = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.surfaceRaised};
`;

export const Badge = styled.span`
  position: absolute;
  top: 12px;
  left: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: rgba(15, 17, 21, 0.62);
  color: #f3f4f6;
  font-size: 0.6875rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  animation: ${fadeIn} ${({ theme }) => theme.motion.slow} ease-out;

  @supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
  }
`;
