import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type PropsWithChildren } from 'react';
import { Check, RefreshCw, ShieldCheck } from 'lucide-react';
import type { HumanChallenge, HumanVerification } from '@/@types';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';
import { BrandLogo } from '@/components/molecules/BrandLogo';
import { InlineAlert } from '@/components/molecules/InlineAlert';
import { getChallengeIcon } from '@/constants/challenge';
import { useHumanCheck } from '@/hooks/useHumanCheck';
import { useSound } from '@/hooks/useSound';
import { ApiClientError, getErrorMessage } from '@/services/httpClient';
import { verificationService } from '@/services/recipeService';
import * as S from './styles';

type Status = 'loading' | 'ready' | 'checking' | 'success' | 'wrong' | 'error';

const SUCCESS_DELAY_MS = 650;
const WRONG_DELAY_MS = 1_100;

const isOffline = (error: unknown) =>
  error instanceof ApiClientError && (error.code === 'NETWORK' || error.code === 'TIMEOUT' || error.status >= 500);

interface HumanChallengePanelProps {
  /** "screen": first-load gate (own heading). "sheet": inside the Modal, which provides the heading. */
  layout: 'screen' | 'sheet';
  onVerified: (verification: HumanVerification) => void;
  /** Screen only: continue without the check when the server cannot be reached. */
  onDefer?: () => void;
}

/**
 * "Verificação rápida": tap the icon the server asked for. The server signs
 * the challenge and checks the answer; the client only draws it.
 */
export function HumanChallengePanel({ layout, onVerified, onDefer }: HumanChallengePanelProps) {
  const instructionId = useId();
  const { play, haptic } = useSound();
  const [challenge, setChallenge] = useState<HumanChallenge | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<{ message: string; offline: boolean } | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const onVerifiedRef = useRef(onVerified);

  useLayoutEffect(() => {
    onVerifiedRef.current = onVerified;
  });

  const showChallenge = useCallback((next: HumanChallenge) => {
    setChallenge(next);
    setSelectedId(null);
    setError(null);
    setStatus('ready');
  }, []);

  const showError = useCallback((cause: unknown) => {
    setError({ message: getErrorMessage(cause), offline: isOffline(cause) });
    setStatus('error');
  }, []);

  /** Starts a fetch; state only changes when it settles, and a newer fetch cancels the older one. */
  const requestChallenge = useCallback(() => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    verificationService.getChallenge(controller.signal).then(
      (next) => {
        if (!controller.signal.aborted) showChallenge(next);
      },
      (cause: unknown) => {
        if (!controller.signal.aborted) showError(cause);
      },
    );
  }, [showChallenge, showError]);

  useEffect(() => {
    requestChallenge();
    return () => {
      controllerRef.current?.abort();
      window.clearTimeout(timerRef.current);
    };
  }, [requestChallenge]);

  const reload = () => {
    window.clearTimeout(timerRef.current);
    setStatus('loading');
    setError(null);
    setSelectedId(null);
    requestChallenge();
  };

  const answer = async (optionId: string) => {
    if (!challenge || status !== 'ready') return;
    setSelectedId(optionId);
    setStatus('checking');
    play('tap');
    try {
      const verification = await verificationService.verify({ token: challenge.token, answer: optionId });
      setStatus('success');
      play('success');
      haptic('success');
      timerRef.current = window.setTimeout(() => onVerifiedRef.current(verification), SUCCESS_DELAY_MS);
    } catch (cause) {
      if (cause instanceof ApiClientError && cause.code === 'CHALLENGE_FAILED') {
        // Every challenge works once: show the miss, then bring new icons.
        setStatus('wrong');
        play('error');
        haptic('error');
        timerRef.current = window.setTimeout(requestChallenge, WRONG_DELAY_MS);
        return;
      }
      showError(cause);
    }
  };

  const instruction =
    status === 'success' ? (
      'Tudo certo! Verificação concluída.'
    ) : challenge && status !== 'loading' && status !== 'error' ? (
      <>
        Toque em <S.Target>{challenge.target}</S.Target> para mostrar que você não é um robô.
      </>
    ) : (
      'Preparando a verificação…'
    );

  const liveMessage =
    status === 'wrong' ? 'Não foi esse ícone. Vamos tentar com outros.' : status === 'success' ? 'Verificação concluída.' : '';

  return (
    <S.Panel aria-busy={status === 'loading' || status === 'checking'}>
      <S.Shield $success={status === 'success'} aria-hidden="true">
        {status === 'success' ? <Check size={30} strokeWidth={3} /> : <ShieldCheck size={30} />}
      </S.Shield>
      {layout === 'screen' && <S.Title>Verificação rápida</S.Title>}
      <S.Instruction id={instructionId}>{instruction}</S.Instruction>

      {status === 'error' && error ? (
        <S.ErrorBox>
          <InlineAlert tone="error">{error.message}</InlineAlert>
          <Button fullWidth leftIcon={<RefreshCw size={18} />} onClick={reload}>
            Tentar de novo
          </Button>
          {error.offline && onDefer && (
            <Button variant="ghost" fullWidth onClick={onDefer}>
              Continuar sem verificar agora
            </Button>
          )}
        </S.ErrorBox>
      ) : (
        <S.Grid role="group" aria-labelledby={instructionId} $shake={status === 'wrong'}>
          {status === 'loading' || !challenge
            ? Array.from({ length: 6 }, (_, index) => <S.Placeholder key={index} aria-hidden="true" />)
            : challenge.options.map((option) => {
                const Icon = getChallengeIcon(option.icon);
                const isSelected = option.id === selectedId;
                const state = !isSelected
                  ? 'idle'
                  : status === 'success'
                    ? 'right'
                    : status === 'wrong'
                      ? 'wrong'
                      : 'pending';
                return (
                  <S.Option
                    key={option.id}
                    type="button"
                    aria-label={option.label}
                    title={option.label}
                    $state={state}
                    disabled={status !== 'ready'}
                    onClick={() => void answer(option.id)}
                  >
                    {isSelected && status === 'checking' ? (
                      <Spinner size={22} />
                    ) : (
                      <Icon size={32} strokeWidth={1.8} aria-hidden="true" />
                    )}
                  </S.Option>
                );
              })}
        </S.Grid>
      )}

      <S.LiveRegion role="status">{liveMessage}</S.LiveRegion>

      {status !== 'error' && status !== 'success' && (
        <S.Footer>
          {status === 'wrong' ? (
            <S.Miss aria-hidden="true">Não foi esse. Trocando os ícones…</S.Miss>
          ) : (
            <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={16} />} onClick={reload} disabled={status !== 'ready'}>
              Trocar ícones
            </Button>
          )}
        </S.Footer>
      )}

      <S.Note>Sem cookies de rastreamento nem serviços de terceiros. Vale por 30 dias neste aparelho.</S.Note>
    </S.Panel>
  );
}

/** First-load gate: shows the check before the app until this device is verified. */
export function HumanCheckGate({ children }: PropsWithChildren) {
  const { isVerified, isDeferred, completeVerification, deferVerification } = useHumanCheck();
  if (isVerified || isDeferred) return children;

  return (
    <S.Screen>
      <BrandLogo />
      <S.ScreenCard>
        <HumanChallengePanel layout="screen" onVerified={completeVerification} onDefer={deferVerification} />
      </S.ScreenCard>
    </S.Screen>
  );
}
