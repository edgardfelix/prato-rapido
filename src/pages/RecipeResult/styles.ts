import styled, { css } from 'styled-components';
import { fadeInUp } from '@/styles/animations';
import { cardSurface, onHover, pressable } from '@/styles/mixins';

export const CookingModeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  text-align: left;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1.5px solid ${({ theme }) => theme.colors.primaryBorder};
  color: ${({ theme }) => theme.colors.primary};
  box-shadow: ${({ theme }) => theme.shadows.card};
  ${pressable(0.98)}

  ${onHover(css`
    background: ${({ theme }) => theme.colors.primarySoft};
  `)}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 2px;
  }
`;

export const CookingModeIcon = styled.span`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
`;

export const CookingModeTexts = styled.span`
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 2px;

  strong {
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

/* WhatsApp shopping list: the app's card style with a WhatsApp-green accent (no brand logo). */
const WHATSAPP_GREEN = '#25D366';

export const WhatsAppLink = styled.a`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  text-decoration: none;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: color-mix(in srgb, ${WHATSAPP_GREEN} 9%, ${({ theme }) => theme.colors.surface});
  border: 1.5px solid color-mix(in srgb, ${WHATSAPP_GREEN} 55%, transparent);
  color: ${({ theme }) => theme.colors.textSecondary};
  box-shadow: ${({ theme }) => theme.shadows.card};
  -webkit-tap-highlight-color: transparent;
  ${pressable(0.98)}

  ${onHover(css`
    background: color-mix(in srgb, ${WHATSAPP_GREEN} 16%, ${({ theme }) => theme.colors.surface});
  `)}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 2px;
  }
`;

export const WhatsAppIcon = styled.span`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${WHATSAPP_GREEN};
  color: #062e16;
`;

export const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`;

export const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const Article = styled.article`
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: ${fadeInUp} ${({ theme }) => theme.motion.slow} ${({ theme }) => theme.motion.easeOut};
`;

export const TitleBlock = styled.header`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
`;

export const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  letter-spacing: -0.03em;
`;

export const Stats = styled.div`
  ${cardSurface}
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 14px 4px;
`;

export const Stat = styled.div`
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  text-align: center;

  & + & {
    border-left: 1px solid ${({ theme }) => theme.colors.border};
  }

  svg {
    margin-bottom: 2px;
    color: ${({ theme }) => theme.colors.primary};
  }

  strong {
    max-width: 100%;
    overflow: hidden;
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    white-space: nowrap;
    text-overflow: ellipsis;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
`;

export const ActionHint = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  text-align: center;
  color: ${({ theme }) => theme.colors.textTertiary};
`;

export const Status = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 60vh;
  padding: 24px 8px;
  text-align: center;
  animation: ${fadeInUp} ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut};
`;

export const StatusIcon = styled.span<{ $tone: 'error' | 'empty' }>`
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  margin-bottom: 4px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme, $tone }) => ($tone === 'error' ? theme.colors.dangerSoft : theme.colors.surfaceRaised)};
  color: ${({ theme, $tone }) => ($tone === 'error' ? theme.colors.danger : theme.colors.textSecondary)};
`;

export const StatusTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
`;

export const StatusMessage = styled.p`
  max-width: 34ch;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StatusActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 320px;
  margin-top: 12px;
`;
