import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/atoms/Button';
import type { Celebration } from '@/context/CelebrationContext';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useSound } from '@/hooks/useSound';
import { prefersReducedMotion } from '@/utils/motion';
import { launchConfetti, readConfettiColors } from './confetti';
import * as S from './styles';

const EXIT_MS = 200;

interface CelebrationModalProps {
  celebration: Celebration | null;
  /** The exit animation started: nothing else should join this celebration. */
  onClosing: (id: number) => void;
  onDismiss: (id: number) => void;
}

/** Full-screen celebration. Each queued celebration mounts a fresh dialog (its own entrance). */
export function CelebrationModal({ celebration, onClosing, onDismiss }: CelebrationModalProps) {
  if (!celebration) return null;
  return createPortal(
    <CelebrationDialog key={celebration.id} celebration={celebration} onClosing={onClosing} onDismiss={onDismiss} />,
    document.body,
  );
}

function CelebrationDialog({ celebration, onClosing, onDismiss }: CelebrationModalProps & { celebration: Celebration }) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const { play, haptic } = useSound();

  const close = useCallback(() => {
    onClosing(celebration.id);
    setIsClosing(true);
  }, [onClosing, celebration.id]);
  useFocusTrap(dialogRef, close);
  useScrollLock();

  // The primary action gets focus, so Enter / Space continues right away.
  useEffect(() => {
    buttonRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    play('celebrate');
    haptic('celebrate');
  }, [play, haptic]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion()) return;
    return launchConfetti(canvas, { colors: readConfettiColors() });
  }, []);

  useEffect(() => {
    if (!isClosing) return;
    const timer = window.setTimeout(() => onDismiss(celebration.id), EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [isClosing, onDismiss, celebration.id]);

  const { tone, eyebrow, title, description, extras } = celebration;
  const Icon = celebration.icon;

  return (
    <S.Overlay $closing={isClosing}>
      <S.Backdrop onClick={close} aria-hidden="true" />
      <S.Card
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        $closing={isClosing}
      >
        <S.Medal $tone={tone} aria-hidden="true">
          <S.Glow $tone={tone} />
          <S.Ring $tone={tone} />
          <Icon size={46} strokeWidth={2.2} />
        </S.Medal>
        {eyebrow && <S.Eyebrow $tone={tone}>{eyebrow}</S.Eyebrow>}
        <S.Title id={titleId}>{title}</S.Title>
        {description && <S.Description id={descriptionId}>{description}</S.Description>}
        {extras.length > 0 && (
          <S.Extras>
            <S.ExtrasLabel>{extras.length === 1 ? 'Conquista desbloqueada' : 'Conquistas desbloqueadas'}</S.ExtrasLabel>
            <S.ExtrasList>
              {extras.map((extra) => {
                const ExtraIcon = extra.icon;
                return (
                  <S.ExtraChip key={extra.title} $tone={extra.tone}>
                    <ExtraIcon size={15} aria-hidden="true" />
                    {extra.title}
                  </S.ExtraChip>
                );
              })}
            </S.ExtrasList>
          </S.Extras>
        )}
        <S.Actions>
          <Button ref={buttonRef} size="lg" fullWidth onClick={close}>
            Continuar
          </Button>
        </S.Actions>
      </S.Card>
      <S.ConfettiCanvas ref={canvasRef} aria-hidden="true" />
    </S.Overlay>
  );
}
