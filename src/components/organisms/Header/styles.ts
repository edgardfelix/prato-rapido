import styled from 'styled-components';

export const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.header};
  padding-top: env(safe-area-inset-top);
  background: ${({ theme }) => theme.colors.headerBackground};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  @supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
    -webkit-backdrop-filter: saturate(160%) blur(16px);
    backdrop-filter: saturate(160%) blur(16px);
  }
`;

export const Inner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: ${({ theme }) => theme.layout.headerHeight};
  padding: 0 12px;
`;

export const Start = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

export const Brand = styled.div`
  padding-left: 8px;
`;

/* A span on purpose: the page content owns the <h1>. */
export const Title = styled.span`
  overflow: hidden;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const End = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;
