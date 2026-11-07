import styled from 'styled-components';

export const IconStack = styled.span<{ $isDark: boolean }>`
  position: relative;
  display: block;
  width: 20px;
  height: 20px;

  svg {
    position: absolute;
    inset: 0;
    transition:
      transform ${({ theme }) => theme.motion.slow} ${({ theme }) => theme.motion.easeOut},
      opacity ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut};
  }

  .sun {
    opacity: ${({ $isDark }) => ($isDark ? 1 : 0)};
    transform: ${({ $isDark }) => ($isDark ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.5)')};
  }

  .moon {
    opacity: ${({ $isDark }) => ($isDark ? 0 : 1)};
    transform: ${({ $isDark }) => ($isDark ? 'rotate(90deg) scale(0.5)' : 'rotate(0deg) scale(1)')};
  }
`;
