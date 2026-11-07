import styled from 'styled-components';

export const Track = styled.button<{ $checked: boolean }>`
  position: relative;
  flex-shrink: 0;
  width: 50px;
  height: 30px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme, $checked }) => ($checked ? theme.colors.primary : theme.colors.surfaceHover)};
  border: 1px solid ${({ theme, $checked }) => ($checked ? 'transparent' : theme.colors.borderStrong)};
  transition: background-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut};
  -webkit-tap-highlight-color: transparent;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.45;
  }
`;

export const Thumb = styled.span<{ $checked: boolean }>`
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transform: translateX(${({ $checked }) => ($checked ? '20px' : '0')});
  transition: transform ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut};
`;
