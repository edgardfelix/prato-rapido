import styled from 'styled-components';
import { cardSurface, visuallyHidden } from '@/styles/mixins';

export const Card = styled.section`
  ${cardSurface}
  padding: 20px;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

export const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

export const Count = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.primary};
`;

export const List = styled.ul`
  display: flex;
  flex-direction: column;
`;

export const Row = styled.label`
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:has(input:focus-visible) {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 2px;
    border-radius: ${({ theme }) => theme.radii.sm};
  }
`;

export const HiddenCheckbox = styled.input`
  ${visuallyHidden}
`;

export const Box = styled.span<{ $checked: boolean }>`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  margin-top: 1px;
  border-radius: 7px;
  border: 2px solid ${({ theme, $checked }) => ($checked ? theme.colors.primary : theme.colors.borderStrong)};
  background: ${({ theme, $checked }) => ($checked ? theme.colors.primary : 'transparent')};
  color: ${({ theme }) => theme.colors.onPrimary};
  transition:
    background-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut},
    border-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut},
    transform ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.motion.easeOut};

  svg {
    opacity: ${({ $checked }) => ($checked ? 1 : 0)};
    transform: scale(${({ $checked }) => ($checked ? 1 : 0.5)});
    transition:
      transform ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut},
      opacity ${({ theme }) => theme.motion.fast} linear;
  }

  label:active & {
    transform: scale(0.9);
  }
`;

export const Text = styled.span<{ $checked: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: 1.45;
  color: ${({ theme, $checked }) => ($checked ? theme.colors.textTertiary : theme.colors.textPrimary)};
  text-decoration: ${({ $checked }) => ($checked ? 'line-through' : 'none')};
  text-decoration-thickness: 1.5px;
  transition: color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut};
`;
