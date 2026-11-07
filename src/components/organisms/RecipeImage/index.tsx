import { useEffect, useState } from 'react';
import { RotateCcw, Sparkles, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Skeleton } from '@/components/atoms/Skeleton';
import { resolveApiUrl } from '@/services/httpClient';
import * as S from './styles';

type ImageStatus = 'loading' | 'loaded' | 'error';

/** After this long, explain that the free generator works one photo at a time. */
const SLOW_HINT_DELAY_MS = 9_000;

interface RecipeImageProps {
  src: string;
  alt: string;
}

/** AI food photo (Pollinations, proxied by the API) with skeleton, fade-in, fallback and retry. */
export function RecipeImage({ src, alt }: RecipeImageProps) {
  const [status, setStatus] = useState<ImageStatus>('loading');
  const [attempt, setAttempt] = useState(0);
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    if (status !== 'loading') return;
    const timer = window.setTimeout(() => setIsSlow(true), SLOW_HINT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [status, attempt]);

  const retry = () => {
    setIsSlow(false);
    setStatus('loading');
    setAttempt((current) => current + 1);
  };

  // A new query string on retry bypasses the browser's memory of the failed request.
  const imageUrl = resolveApiUrl(attempt === 0 ? src : `${src}&attempt=${attempt}`);

  return (
    <S.Frame>
      {status === 'loading' && (
        <S.Placeholder aria-hidden="true">
          <Skeleton height="100%" radius="0" />
          <S.PlaceholderLabel>
            <Sparkles size={16} />
            {isSlow ? 'Na fila do gerador gratuito, quase lá…' : 'Gerando a foto do prato…'}
          </S.PlaceholderLabel>
        </S.Placeholder>
      )}

      {status === 'error' ? (
        <S.Fallback>
          <UtensilsCrossed size={28} aria-hidden="true" />
          <span>Não foi possível carregar a foto agora.</span>
          <Button size="sm" variant="secondary" leftIcon={<RotateCcw size={16} />} onClick={retry}>
            Tentar de novo
          </Button>
        </S.Fallback>
      ) : (
        <S.Image
          key={attempt}
          src={imageUrl}
          alt={alt}
          width={1024}
          height={768}
          decoding="async"
          fetchPriority="high"
          $visible={status === 'loaded'}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}

      {status === 'loaded' && (
        <S.Badge>
          <Sparkles size={12} aria-hidden="true" /> Imagem gerada por IA
        </S.Badge>
      )}
    </S.Frame>
  );
}
