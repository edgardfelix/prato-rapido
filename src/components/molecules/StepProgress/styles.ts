import styled from 'styled-components';

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const Header = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
`;

export const Counter = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.primary};
`;

export const Label = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Track = styled.div`
  display: flex;
  gap: 6px;
`;

export const Segment = styled.span<{ $filled: boolean }>`
  position: relative;
  flex: 1;
  height: 4px;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.surfaceRaised};

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: ${({ theme }) => theme.colors.primary};
    transform-origin: left center;
    transform: scaleX(${({ $filled }) => ($filled ? 1 : 0)});
    transition: transform ${({ theme }) => theme.motion.slow} ${({ theme }) => theme.motion.easeOut};
  }
`;
