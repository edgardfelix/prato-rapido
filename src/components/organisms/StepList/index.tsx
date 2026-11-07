import { useId, useState } from 'react';
import { Check } from 'lucide-react';
import { useSound } from '@/hooks/useSound';
import * as S from './styles';

interface StepListProps {
  steps: string[];
}

/** Numbered cooking guide. Tapping a step marks it as done. */
export function StepList({ steps }: StepListProps) {
  const headingId = useId();
  const [done, setDone] = useState<ReadonlySet<number>>(() => new Set());
  const { play } = useSound();

  const toggle = (index: number) => {
    // The last step to be checked gets the "success" chord.
    if (done.has(index)) play('uncheck');
    else play(done.size + 1 === steps.length ? 'success' : 'check');
    setDone((previous) => {
      const next = new Set(previous);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <S.Card aria-labelledby={headingId}>
      <S.Header>
        <S.Title id={headingId}>Modo de preparo</S.Title>
        <S.Count aria-label={`${done.size} de ${steps.length} passos concluídos`}>
          {done.size}/{steps.length}
        </S.Count>
      </S.Header>
      <S.List>
        {steps.map((step, index) => {
          const isDone = done.has(index);
          return (
            <S.Item key={`${index}-${step.slice(0, 24)}`} $isLast={index === steps.length - 1}>
              <S.StepButton type="button" aria-pressed={isDone} onClick={() => toggle(index)}>
                <S.StepNumber $done={isDone} aria-hidden="true">
                  {isDone ? <Check size={16} strokeWidth={3} /> : index + 1}
                </S.StepNumber>
                <S.StepText $done={isDone}>
                  <S.VisuallyHidden>Passo {index + 1}: </S.VisuallyHidden>
                  {step}
                </S.StepText>
              </S.StepButton>
            </S.Item>
          );
        })}
      </S.List>
      <S.Hint>Toque em um passo para marcar como feito.</S.Hint>
    </S.Card>
  );
}
