import styled from 'styled-components';
import { cardSurface } from '@/styles/mixins';

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

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`;

export const ProgressCard = styled.div`
  ${cardSurface}
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 18px;
`;

export const ProgressHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;

  strong {
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const FinishedCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 24px 20px;
  text-align: center;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.goldSoft};
  border: 1px solid ${({ theme }) => theme.colors.gold};
  color: ${({ theme }) => theme.colors.gold};

  strong {
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: ${({ theme }) => theme.fontSizes.xl};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  span {
    margin-bottom: 6px;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const Footer = styled.footer`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

export const Footnote = styled.p`
  max-width: 36ch;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  text-align: center;
  color: ${({ theme }) => theme.colors.textTertiary};
`;
