import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/atoms/Skeleton';
import { Spinner } from '@/components/atoms/Spinner';
import * as S from './styles';

const STATUS_MESSAGES = [
  'Lendo seus ingredientes…',
  'Combinando os sabores…',
  'Ajustando ao seu perfil…',
  'Escrevendo o passo a passo…',
  'Finalizando os detalhes…',
];

/** Skeleton of the recipe screen with progressive status messages (no fake looping). */
export function Loader() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMessageIndex((current) => Math.min(current + 1, STATUS_MESSAGES.length - 1));
    }, 2400);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <S.Root aria-busy="true">
      <S.Status role="status" aria-live="polite">
        <Spinner size={18} />
        <S.StatusText key={messageIndex}>{STATUS_MESSAGES[messageIndex]}</S.StatusText>
      </S.Status>

      <S.ImageBox>
        <Skeleton height="100%" radius="0" />
      </S.ImageBox>

      <S.Stack>
        <Skeleton width="88%" height="30px" radius="10px" />
        <Skeleton width="56%" height="30px" radius="10px" />
      </S.Stack>

      <S.Row>
        <Skeleton width="84px" height="28px" radius="999px" />
        <Skeleton width="72px" height="28px" radius="999px" />
        <Skeleton width="108px" height="28px" radius="999px" />
      </S.Row>

      <S.Card>
        <Skeleton width="42%" height="20px" />
        {[78, 64, 86, 52, 70].map((width) => (
          <S.Row key={width}>
            <Skeleton width="22px" height="22px" radius="7px" />
            <Skeleton width={`${width}%`} height="16px" />
          </S.Row>
        ))}
      </S.Card>

      <S.Card>
        <Skeleton width="48%" height="20px" />
        {[0, 1, 2].map((item) => (
          <S.Row key={item} $alignTop>
            <Skeleton width="32px" height="32px" radius="999px" />
            <S.Stack $grow>
              <Skeleton height="15px" />
              <Skeleton width="72%" height="15px" />
            </S.Stack>
          </S.Row>
        ))}
      </S.Card>
    </S.Root>
  );
}
