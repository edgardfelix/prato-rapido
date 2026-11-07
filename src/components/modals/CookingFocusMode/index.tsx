import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronLeft, ChevronRight, ListChecks, Sun, X } from 'lucide-react';
import type { RecipeResponse } from '@/@types';
import { Button } from '@/components/atoms/Button';
import { IconButton } from '@/components/atoms/IconButton';
import { Switch } from '@/components/atoms/Switch';
import { Modal } from '@/components/organisms/Modal';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useHorizontalSwipe } from '@/hooks/useHorizontalSwipe';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useWakeLock, type WakeLockStatus } from '@/hooks/useWakeLock';
import * as S from './styles';

const WAKE_STATUS_TEXT: Record<WakeLockStatus, string> = {
  active: 'Ativada: a tela não vai apagar',
  idle: 'Desligada',
  denied: 'O navegador não permitiu agora',
  unsupported: 'Indisponível neste navegador',
};

interface CookingFocusModeProps {
  recipe: RecipeResponse;
  onClose: () => void;
  /** Called from the last step ("Concluir prato"). */
  onFinish: () => void;
}

/**
 * "Modo Cozinha": a full-screen, distraction-free modal for reading while
 * cooking. One oversized step per card, swipe / buttons / arrow keys to move,
 * and the Screen Wake Lock API (`navigator.wakeLock.request('screen')`, see
 * useWakeLock) keeps the display from dimming or sleeping.
 */
export function CookingFocusMode({ recipe, onClose, onFinish }: CookingFocusModeProps) {
  const steps = recipe.passo_a_passo;
  const total = steps.length;
  const [index, setIndex] = useState(0);
  const [keepAwake, setKeepAwake] = useState(true);
  const [isIngredientsOpen, setIsIngredientsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const wakeStatus = useWakeLock(keepAwake);

  useFocusTrap(dialogRef, onClose);
  useScrollLock();

  const goNext = useCallback(() => setIndex((current) => Math.min(total - 1, current + 1)), [total]);
  const goPrevious = useCallback(() => setIndex((current) => Math.max(0, current - 1)), []);

  const { viewportRef, trackRef } = useHorizontalSwipe<HTMLDivElement, HTMLDivElement>({
    onSwipeLeft: goNext,
    onSwipeRight: goPrevious,
    canSwipeLeft: index < total - 1,
    canSwipeRight: index > 0,
  });

  useEffect(() => {
    if (isIngredientsOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') goNext();
      else if (event.key === 'ArrowLeft') goPrevious();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrevious, isIngredientsOpen]);

  const isLast = index === total - 1;
  const statusText = keepAwake ? WAKE_STATUS_TEXT[wakeStatus] : WAKE_STATUS_TEXT.idle;

  return createPortal(
    <S.Overlay
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Modo Cozinha: ${recipe.nome_receita}`}
      tabIndex={-1}
    >
      <S.TopBar>
        <IconButton variant="ghost" label="Sair do Modo Cozinha" onClick={onClose}>
          <X size={22} />
        </IconButton>
        <S.Counter aria-live="polite">
          Passo {index + 1} de {total}
        </S.Counter>
        <IconButton variant="ghost" label="Ver ingredientes" onClick={() => setIsIngredientsOpen(true)}>
          <ListChecks size={22} />
        </IconButton>
      </S.TopBar>

      <S.Progress aria-hidden="true">
        {steps.map((step, stepIndex) => (
          <S.Segment key={`${stepIndex}-${step.slice(0, 12)}`} $filled={stepIndex <= index} />
        ))}
      </S.Progress>

      <S.RecipeName>{recipe.nome_receita}</S.RecipeName>

      <S.Viewport ref={viewportRef}>
        <S.Track ref={trackRef} style={{ '--index': index } as CSSProperties}>
          {steps.map((step, stepIndex) => (
            <S.Card
              key={`${stepIndex}-${step.slice(0, 12)}`}
              $active={stepIndex === index}
              aria-hidden={stepIndex !== index}
            >
              <S.StepNumber>{stepIndex + 1}</S.StepNumber>
              <S.StepText>{step}</S.StepText>
            </S.Card>
          ))}
        </S.Track>
      </S.Viewport>

      <S.WakeRow>
        <S.WakeIcon $active={keepAwake && wakeStatus === 'active'} aria-hidden="true">
          <Sun size={18} />
        </S.WakeIcon>
        <S.WakeTexts>
          <strong>Tela sempre ligada</strong>
          <span>{statusText}</span>
        </S.WakeTexts>
        <Switch
          checked={keepAwake && wakeStatus !== 'unsupported'}
          onChange={setKeepAwake}
          label="Manter a tela ligada"
          disabled={wakeStatus === 'unsupported'}
        />
      </S.WakeRow>

      <S.BottomBar>
        <Button
          variant="secondary"
          size="lg"
          leftIcon={<ChevronLeft size={20} />}
          onClick={goPrevious}
          disabled={index === 0}
        >
          Anterior
        </Button>
        {isLast ? (
          <Button size="lg" leftIcon={<Check size={20} />} onClick={onFinish}>
            Concluir prato
          </Button>
        ) : (
          <Button size="lg" rightIcon={<ChevronRight size={20} />} onClick={goNext}>
            Próximo
          </Button>
        )}
      </S.BottomBar>

      <Modal isOpen={isIngredientsOpen} onClose={() => setIsIngredientsOpen(false)} title="Ingredientes">
        <S.Ingredients>
          {recipe.ingredientes_utilizados.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </S.Ingredients>
      </Modal>
    </S.Overlay>,
    document.body,
  );
}
