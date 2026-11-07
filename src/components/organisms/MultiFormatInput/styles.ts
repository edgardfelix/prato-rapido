import styled, { css } from 'styled-components';
import { blink, fadeIn, pulseRing, scanLine } from '@/styles/animations';
import { cardSurface, onHover, pressable, visuallyHidden } from '@/styles/mixins';

export const Card = styled.section<{ $isRecording: boolean }>`
  ${cardSurface}
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  transition:
    border-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut},
    box-shadow ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut};

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primaryBorder};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.primarySoft};
  }

  ${({ $isRecording, theme }) =>
    $isRecording &&
    css`
      border-color: ${theme.colors.danger};

      &:focus-within {
        border-color: ${theme.colors.danger};
        box-shadow: 0 0 0 4px ${theme.colors.dangerSoft};
      }
    `}
`;

export const LabelRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const Label = styled.label`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const ModeChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 4px 0 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  animation: ${fadeIn} ${({ theme }) => theme.motion.base} ease-out;
`;

export const ModeChipClear = styled.button`
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: ${({ theme }) => theme.radii.full};
  color: inherit;
  ${pressable(0.9)}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 84px;
  padding: 0;
  border: 0;
  resize: none;
  background: transparent;
  font-size: 16px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textPrimary};
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textTertiary};
  }
`;

export const Counter = styled.span`
  align-self: flex-end;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.textTertiary};
`;

export const Attachments = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const StatusChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  height: 36px;
  padding: 0 14px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  animation: ${fadeIn} ${({ theme }) => theme.motion.base} ease-out;
`;

export const ImageChip = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 8px 8px 8px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  animation: ${fadeIn} ${({ theme }) => theme.motion.base} ease-out;
`;

export const Thumb = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.skeleton};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const ScanOverlay = styled.span`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(16, 185, 129, 0.55) 48%, rgba(16, 185, 129, 0.9) 50%, transparent 52%);
  animation: ${scanLine} 1.1s ${({ theme }) => theme.motion.easeInOut} infinite;
`;

export const ChipText = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 2px;

  strong {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 56px;
  padding-top: 8px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export const Tools = styled.div`
  display: flex;
  gap: 8px;
`;

export const RecordingBar = styled.div`
  --level: 0;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  animation: ${fadeIn} ${({ theme }) => theme.motion.base} ease-out;
`;

export const RecordingInfo = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

export const RecDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.danger};
  animation: ${blink} 1.2s ease-in-out infinite;
`;

export const Timer = styled.span`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const TimerLimit = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.textTertiary};
`;

export const LevelBars = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 24px;
  margin-left: 4px;

  span {
    width: 3px;
    height: 24px;
    border-radius: 2px;
    background: ${({ theme }) => theme.colors.danger};
    transform: scaleY(min(1, calc(0.18 + var(--level) * var(--gain))));
    transition: transform 90ms linear;
  }
`;

export const StopButton = styled.button`
  position: relative;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.onDanger};
  ${pressable(0.92)}

  svg {
    position: relative;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 3px;
  }
`;

export const PulseRing = styled.span`
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: ${({ theme }) => theme.colors.danger};
  opacity: 0.35;
  transform: scale(calc(1 + var(--level) * 0.45));
  transition: transform 90ms linear;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    border: 2px solid ${({ theme }) => theme.colors.danger};
    animation: ${pulseRing} 1.6s ${({ theme }) => theme.motion.easeOut} infinite;
  }
`;

export const LiveRegion = styled.span`
  ${visuallyHidden}
`;

export const HiddenFileInput = styled.input`
  ${visuallyHidden}
`;

export const SheetOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const SheetOption = styled.button`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px;
  text-align: left;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border: 1px solid ${({ theme }) => theme.colors.border};
  ${pressable(0.98)}

  ${onHover(css`
    background: ${({ theme }) => theme.colors.surfaceHover};
  `)}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 2px;
  }
`;

export const SheetIcon = styled.span`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.primary};
`;

export const SheetText = styled.span`
  display: flex;
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
