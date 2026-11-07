import styled, { css } from 'styled-components';
import { cardSurface, onHover } from '@/styles/mixins';

export const Card = styled.article<{ $expanded: boolean }>`
  ${cardSurface}
  overflow: hidden;
  border-color: ${({ theme, $expanded }) => ($expanded ? theme.colors.primaryBorder : theme.colors.border)};
  transition: border-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut};
`;

export const Header = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  width: 100%;
  padding: 16px;
  text-align: left;
  -webkit-tap-highlight-color: transparent;
  transition: background-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut};

  ${onHover(css`
    background: ${({ theme }) => theme.colors.surfaceRaised};
  `)}

  &:active {
    background: ${({ theme }) => theme.colors.surfaceRaised};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: -2px;
  }
`;

export const IconTile = styled.span`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.primary};
`;

export const Texts = styled.span`
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
`;

export const Meta = styled.span`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 0.6875rem;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textTertiary};
`;

export const ForYou = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 20px;
  padding: 0 8px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.streakSoft};
  color: ${({ theme }) => theme.colors.streak};
  letter-spacing: 0;
  text-transform: none;
`;

export const Title = styled.span`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: ${({ theme }) => theme.lineHeights.snug};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Summary = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Chevron = styled.span<{ $expanded: boolean }>`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  margin-top: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
  transform: rotate(${({ $expanded }) => ($expanded ? '180deg' : '0deg')});
  transition: transform ${({ theme }) => theme.motion.slow} ${({ theme }) => theme.motion.easeOut};
`;

export const Panel = styled.div<{ $expanded: boolean }>`
  display: grid;
  grid-template-rows: ${({ $expanded }) => ($expanded ? '1fr' : '0fr')};
  visibility: ${({ $expanded }) => ($expanded ? 'visible' : 'hidden')};
  transition:
    grid-template-rows ${({ theme }) => theme.motion.slow} ${({ theme }) => theme.motion.easeOut},
    visibility 0s linear ${({ $expanded, theme }) => ($expanded ? '0s' : theme.motion.slow)};
`;

export const PanelInner = styled.div`
  min-height: 0;
  overflow: hidden;
`;

export const Details = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0 16px 18px 70px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textPrimary};

  li {
    position: relative;
    padding-left: 16px;
  }

  li::before {
    content: '';
    position: absolute;
    top: 0.6em;
    left: 0;
    width: 6px;
    height: 6px;
    border-radius: ${({ theme }) => theme.radii.full};
    background: ${({ theme }) => theme.colors.primary};
  }
`;
