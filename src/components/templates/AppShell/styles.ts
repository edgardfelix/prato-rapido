import styled from 'styled-components';

export const Viewport = styled.div`
  display: flex;
  justify-content: center;
  min-height: 100vh;
  min-height: 100dvh;
`;

export const Column = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  min-height: 100vh;
  min-height: 100dvh;
  background: ${({ theme }) => theme.colors.background};
  /* Clips decorative overflow (e.g. pulse rings) without creating a scroll container, so sticky still works. */
  overflow-x: clip;

  @media (min-width: 521px) {
    border-inline: 1px solid ${({ theme }) => theme.colors.border};
    box-shadow: 0 0 80px rgba(0, 0, 0, 0.18);
  }
`;
