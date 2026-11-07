import styled from 'styled-components';
import { visuallyHidden } from '@/styles/mixins';

export const ResultCount = styled.p`
  ${visuallyHidden}
`;

export const Intro = styled.header`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  letter-spacing: -0.03em;
`;

export const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const DailyCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.primarySoft};
  border: 1px solid ${({ theme }) => theme.colors.primaryBorder};
`;

export const DailyLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.primary};
`;

export const DailyTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

export const DailyText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const Footnote = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  text-align: center;
  color: ${({ theme }) => theme.colors.textTertiary};
`;
