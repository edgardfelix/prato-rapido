import styled from 'styled-components';
import { visuallyHidden } from '@/styles/mixins';

export const Root = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--count), minmax(0, 1fr));
  padding: 4px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const Indicator = styled.span`
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc((100% - 8px) / var(--count));
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
  transform: translateX(calc(var(--index) * 100%));
  transition: transform ${({ theme }) => theme.motion.slow} ${({ theme }) => theme.motion.easeOut};
`;

export const Option = styled.label<{ $active: boolean }>`
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  min-height: 40px;
  padding: 0 6px;
  text-align: center;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme, $active }) => ($active ? theme.fontWeights.bold : theme.fontWeights.medium)};
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.textSecondary)};
  transition: color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut};
  -webkit-tap-highlight-color: transparent;

  &:has(input:focus-visible) {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 1px;
  }
`;

export const Input = styled.input`
  ${visuallyHidden}
`;
