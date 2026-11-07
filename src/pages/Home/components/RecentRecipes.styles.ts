import { Link } from 'react-router';
import styled, { css } from 'styled-components';
import { cardSurface, onHover, pressable } from '@/styles/mixins';

export const Count = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const List = styled.ul`
  ${cardSurface}
  display: flex;
  flex-direction: column;
  overflow: hidden;

  li + li {
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

export const Item = styled(Link)`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  ${pressable(0.98)}

  ${onHover(css`
    background: ${({ theme }) => theme.colors.surfaceRaised};
  `)}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: -2px;
  }
`;

export const Thumb = styled.span`
  position: relative;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.textTertiary};

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const Info = styled.span`
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 2px;

  strong {
    overflow: hidden;
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    white-space: nowrap;
    text-overflow: ellipsis;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;

export const ToggleButton = styled.button`
  align-self: center;
  height: 40px;
  padding: 0 16px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.primary};
  ${pressable(0.96)}

  ${onHover(css`
    background: ${({ theme }) => theme.colors.primarySoft};
  `)}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
  }
`;
