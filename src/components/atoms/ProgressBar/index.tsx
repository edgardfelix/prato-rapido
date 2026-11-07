import type { CelebrationTone } from '@/constants/journey';
import * as S from './styles';

interface ProgressBarProps {
  /** 0..1 */
  value: number;
  label: string;
  tone?: CelebrationTone;
  height?: number;
}

/** Compositor-only progress bar (scaleX). */
export function ProgressBar({ value, label, tone = 'primary', height = 8 }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <S.Track
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      style={{ height }}
    >
      <S.Fill $tone={tone} style={{ transform: `scaleX(${clamped})` }} />
    </S.Track>
  );
}
