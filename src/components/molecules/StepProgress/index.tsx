import * as S from './styles';

interface StepProgressProps {
  current: number;
  total: number;
  label: string;
}

/** Segmented progress indicator for the onboarding flow. */
export function StepProgress({ current, total, label }: StepProgressProps) {
  return (
    <S.Root>
      <S.Header>
        <S.Counter>
          Passo {current} de {total}
        </S.Counter>
        <S.Label>{label}</S.Label>
      </S.Header>
      <S.Track
        role="progressbar"
        aria-label="Progresso do cadastro"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-valuetext={`Passo ${current} de ${total}: ${label}`}
      >
        {Array.from({ length: total }, (_, index) => (
          <S.Segment key={index} $filled={index < current} />
        ))}
      </S.Track>
    </S.Root>
  );
}
