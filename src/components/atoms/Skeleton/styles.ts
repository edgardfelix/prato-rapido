import styled from 'styled-components';
import { shimmer } from '@/styles/animations';

export const Block = styled.span`
  position: relative;
  display: block;
  flex-shrink: 0;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.skeleton};
  border-radius: ${({ theme }) => theme.radii.sm};

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background: linear-gradient(90deg, transparent, ${({ theme }) => theme.colors.skeletonShine}, transparent);
    animation: ${shimmer} 1.4s ease-in-out infinite;
  }
`;
