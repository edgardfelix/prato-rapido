import styled from 'styled-components';
import { fadeInUp } from '@/styles/animations';
import { cardSurface } from '@/styles/mixins';

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const Status = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

export const StatusText = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary};
  animation: ${fadeInUp} ${({ theme }) => theme.motion.slow} ${({ theme }) => theme.motion.easeOut};
`;

export const ImageBox = styled.div`
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.xl};
`;

export const Stack = styled.div<{ $grow?: boolean }>`
  display: flex;
  flex: ${({ $grow }) => ($grow ? 1 : 'initial')};
  flex-direction: column;
  gap: 8px;
`;

export const Row = styled.div<{ $alignTop?: boolean }>`
  display: flex;
  align-items: ${({ $alignTop }) => ($alignTop ? 'flex-start' : 'center')};
  gap: 12px;
`;

export const Card = styled.div`
  ${cardSurface}
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
`;
