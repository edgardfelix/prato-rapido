import styled from 'styled-components';

export const Compact = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

export const Mark = styled.img`
  width: auto;
  height: 28px;

  &[hidden] {
    display: none;
  }
`;

export const Wordmark = styled.span`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.0625rem;
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.textPrimary};

  span {
    color: ${({ theme }) => theme.colors.brand};
  }
`;

export const Full = styled.img`
  width: 148px;
  height: auto;
`;
