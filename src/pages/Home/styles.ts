import { Link } from 'react-router';
import styled, { css } from 'styled-components';
import { fadeInUp } from '@/styles/animations';
import { onHover, pressable } from '@/styles/mixins';

export const Greeting = styled.section`
  display: flex;
  flex-direction: column;
`;

export const GreetingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

export const AvatarLink = styled(Link)`
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radii.full};
  ${pressable(0.92)}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 3px;
  }
`;

export const Hello = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Name = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.display};
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  letter-spacing: -0.035em;
`;

export const Subtitle = styled.p`
  margin-top: 6px;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
`;

export const PendingBanner = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 14px 16px;
  text-align: left;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.primarySoft};
  border: 1px solid ${({ theme }) => theme.colors.primaryBorder};
  color: ${({ theme }) => theme.colors.primary};
  animation: ${fadeInUp} ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut};
  ${pressable(0.98)}

  span {
    flex: 1;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  strong {
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }

  ${onHover(css`
    border-color: ${({ theme }) => theme.colors.primary};
  `)}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 2px;
  }
`;

export const QuickGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
`;

/* "Modo Marmitas": a modifier pill that combines with any quick action. */
export const BatchToggle = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  text-align: left;
  border-radius: ${({ theme }) => theme.radii.xl};
  border: 1.5px solid ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ theme, $active }) => ($active ? theme.colors.primarySoft : theme.colors.surface)};
  transition:
    border-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut},
    background-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut};
  ${pressable(0.98)}

  ${onHover(css`
    border-color: ${({ theme }) => theme.colors.primaryBorder};
  `)}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 2px;
  }
`;

export const BatchIcon = styled.span<{ $active: boolean }>`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.surfaceRaised)};
  color: ${({ theme, $active }) => ($active ? theme.colors.onPrimary : theme.colors.textSecondary)};
  transition:
    background-color ${({ theme }) => theme.motion.base} ease,
    color ${({ theme }) => theme.motion.base} ease;
`;

export const BatchTexts = styled.span`
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 1px;

  strong {
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const BatchCheck = styled.span<{ $active: boolean }>`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 2px solid ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.borderStrong)};
  background: ${({ theme, $active }) => ($active ? theme.colors.primary : 'transparent')};
  color: ${({ theme }) => theme.colors.onPrimary};
  transition:
    background-color ${({ theme }) => theme.motion.base} ease,
    border-color ${({ theme }) => theme.motion.base} ease;

  svg {
    opacity: ${({ $active }) => ($active ? 1 : 0)};
    transform: scale(${({ $active }) => ($active ? 1 : 0.4)});
    transition:
      opacity ${({ theme }) => theme.motion.fast} ease,
      transform ${({ theme }) => theme.motion.base} cubic-bezier(0.34, 1.56, 0.64, 1);
  }
`;

/** Scroll target for "Usar o Limpa Geladeira agora" (keeps the composer clear of the sticky header). */
export const Composer = styled.div`
  scroll-margin-top: calc(${({ theme }) => theme.layout.headerHeight} + 16px);
`;
