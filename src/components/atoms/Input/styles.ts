import styled from 'styled-components';

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xs};
`;

export const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Control = styled.div<{ $hasError: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border: 1px solid ${({ theme, $hasError }) => ($hasError ? theme.colors.danger : theme.colors.border)};
  transition:
    border-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut},
    box-shadow ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut};

  &:focus-within {
    border-color: ${({ theme, $hasError }) => ($hasError ? theme.colors.danger : theme.colors.primaryBorder)};
    box-shadow: 0 0 0 4px ${({ theme, $hasError }) => ($hasError ? theme.colors.dangerSoft : theme.colors.primarySoft)};
  }
`;

export const IconSlot = styled.span`
  position: absolute;
  left: 16px;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  pointer-events: none;
`;

export const InputElement = styled.input<{ $hasIcon: boolean }>`
  width: 100%;
  height: 52px;
  padding: 0 16px 0 ${({ $hasIcon }) => ($hasIcon ? '46px' : '16px')};
  border: 0;
  background: transparent;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textPrimary};
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textTertiary};
  }

  /* Hide number spinners: age is typed with the numeric keypad. */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type='number'] {
    -moz-appearance: textfield;
    appearance: textfield;
  }
`;

export const Message = styled.p<{ $isError: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme, $isError }) => ($isError ? theme.colors.danger : theme.colors.textSecondary)};
`;
