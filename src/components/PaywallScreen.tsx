import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Check, KeyRound, Mail, RefreshCw, ShieldCheck, ShoppingBag } from 'lucide-react';
import styled, { css } from 'styled-components';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { BrandLogo } from '@/components/molecules/BrandLogo';
import { InlineAlert } from '@/components/molecules/InlineAlert';
import { useAccess } from '@/hooks/useAccess';
import { useSound } from '@/hooks/useSound';
import { useToast } from '@/hooks/useToast';
import { accessService } from '@/services/accessService';
import { getErrorMessage } from '@/services/httpClient';
import { fadeInUp, medalPop, pulseRing } from '@/styles/animations';
import { cardSurface, pressable, visuallyHidden } from '@/styles/mixins';
import { EMAIL_MAX_LENGTH, isValidEmail, normalizeEmail } from '@/utils/email';
import { prefersReducedMotion } from '@/utils/motion';

/** How long the "Acesso liberado!" moment stays before the app opens. */
const SUCCESS_MS = 1_600;

type Stage = 'idle' | 'checking' | 'not-found' | 'success';

const Screen = styled.main`
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: calc(24px + env(safe-area-inset-top)) ${({ theme }) => theme.layout.gutter}
    calc(24px + env(safe-area-inset-bottom));
  animation: ${fadeInUp} 420ms ${({ theme }) => theme.motion.easeOut} both;
`;

const Card = styled.section`
  ${cardSurface}
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 28px 20px 22px;
  text-align: center;
`;

const Medal = styled.span<{ $success: boolean }>`
  position: relative;
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme, $success }) => ($success ? theme.colors.primary : theme.colors.primarySoft)};
  color: ${({ theme, $success }) => ($success ? theme.colors.onPrimary : theme.colors.primary)};
  transition:
    background-color ${({ theme }) => theme.motion.base} ease,
    color ${({ theme }) => theme.motion.base} ease;

  ${({ $success, theme }) =>
    $success &&
    css`
      animation: ${medalPop} 760ms ${theme.motion.easeOut} both;

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        border: 2px solid ${theme.colors.primary};
        animation: ${pulseRing} 1.4s ${theme.motion.easeOut} 300ms infinite;
      }
    `}
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  line-height: ${({ theme }) => theme.lineHeights.tight};
  letter-spacing: -0.03em;
  text-wrap: balance;
`;

const Subtitle = styled.p`
  max-width: 34ch;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.lineHeights.normal};
`;

const Form = styled.form`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 14px;
  margin-top: 4px;
  text-align: left;
`;

const Block = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 12px;
  text-align: left;
  animation: ${fadeInUp} 320ms ${({ theme }) => theme.motion.easeOut} both;
`;

/** Checkout link with the brand orange, so the purchase stands apart from "Verificar Acesso". */
const BuyLink = styled.a`
  display: inline-flex;
  width: 100%;
  height: 52px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.brand};
  color: #ffffff;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.0625rem;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-decoration: none;
  box-shadow: 0 10px 24px -12px ${({ theme }) => theme.colors.brand};
  ${pressable(0.96)}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 3px;
  }
`;

const BuyHint = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};

  a {
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    color: ${({ theme }) => theme.colors.brand};
    text-underline-offset: 3px;
  }
`;

const Note = styled.p`
  max-width: 38ch;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  line-height: ${({ theme }) => theme.lineHeights.snug};
  color: ${({ theme }) => theme.colors.textTertiary};
`;

const ConfettiCanvas = styled.canvas`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.zIndex.celebration};
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const LiveRegion = styled.span`
  ${visuallyHidden}
`;

/**
 * "Ative seu Acesso ao Prato Rápido": the buyer types the Cakto purchase
 * e-mail; the server checks the buyer list (Upstash) and returns a signed
 * access token. Shown by AccessGate instead of the app while locked.
 */
export function PaywallScreen() {
  const { grantAccess, checkoutUrl, priceLabel, lockMessage, statusError, retryStatus } = useAccess();
  const { notify } = useToast();
  const { play, haptic } = useSound();
  const formHintId = useId();
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const stopConfettiRef = useRef<(() => void) | null>(null);

  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current);
      stopConfettiRef.current?.();
    },
    [],
  );

  const celebrate = () => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion()) return;
    // The confetti lives in the celebration chunk: loaded only for this moment.
    void import('@/components/modals/CelebrationModal/confetti').then(({ launchConfetti, readConfettiColors }) => {
      stopConfettiRef.current = launchConfetti(canvas, { colors: readConfettiColors(), origin: { x: 0.5, y: 0.3 }, count: 120 });
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (stage === 'checking' || stage === 'success') return;

    const normalized = normalizeEmail(email);
    if (!isValidEmail(normalized)) {
      setFieldError('Digite um e-mail válido, como nome@email.com.');
      event.currentTarget.querySelector('input')?.focus();
      return;
    }

    setFieldError(null);
    setStage('checking');
    try {
      const result = await accessService.verifyEmail({ email: normalized });
      if (result.success === true && typeof result.accessToken === 'string') {
        setStage('success');
        play('celebrate');
        haptic('celebrate');
        celebrate();
        const grant = { email: normalized, token: result.accessToken, expiresAt: result.expiresAt };
        timerRef.current = window.setTimeout(() => grantAccess(grant), SUCCESS_MS);
        return;
      }
      setStage('not-found');
      play('error');
      haptic('error');
      notify({
        id: 'paywall',
        tone: 'error',
        placement: 'top',
        title: 'E-mail não encontrado',
        description: 'Confira o e-mail usado na Cakto ou garanta seu acesso.',
      });
    } catch (error) {
      setStage('idle');
      play('error');
      notify({
        id: 'paywall',
        tone: 'error',
        placement: 'top',
        title: 'Não deu para verificar agora',
        description: getErrorMessage(error),
      });
    }
  };

  const isSuccess = stage === 'success';
  const buyLabel = `Comprar Acesso (${priceLabel})`;

  return (
    <Screen>
      <BrandLogo />
      <Card aria-labelledby="paywall-title">
        <Medal $success={isSuccess} aria-hidden="true">
          {isSuccess ? <Check size={34} strokeWidth={3} /> : <KeyRound size={30} />}
        </Medal>
        <Title id="paywall-title">{isSuccess ? 'Acesso liberado!' : 'Ative seu Acesso ao Prato Rápido'}</Title>
        <Subtitle>
          {isSuccess
            ? 'Tudo certo com a sua compra. Abrindo o Prato Rápido…'
            : 'Digite o e-mail utilizado na compra na Cakto para liberar o app neste aparelho.'}
        </Subtitle>

        {!isSuccess && lockMessage && (
          <Block>
            <InlineAlert tone="warning" title="Ative o acesso de novo">
              {lockMessage}
            </InlineAlert>
          </Block>
        )}

        {!isSuccess && statusError && (
          <Block>
            <InlineAlert
              tone="warning"
              action={
                <Button size="sm" variant="secondary" leftIcon={<RefreshCw size={16} />} onClick={retryStatus}>
                  Tentar de novo
                </Button>
              }
            >
              Sem conexão com o servidor agora. Confira sua internet.
            </InlineAlert>
          </Block>
        )}

        {!isSuccess && (
          <Form onSubmit={handleSubmit} noValidate aria-describedby={formHintId}>
            <Input
              label="E-mail da compra"
              icon={Mail}
              name="purchase-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="voce@email.com"
              maxLength={EMAIL_MAX_LENGTH}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (fieldError) setFieldError(null);
                if (stage === 'not-found') setStage('idle');
              }}
              error={fieldError ?? undefined}
            />
            <Button type="submit" size="lg" fullWidth isLoading={stage === 'checking'} leftIcon={<ShieldCheck size={20} />}>
              Verificar Acesso
            </Button>
          </Form>
        )}

        {stage === 'not-found' && (
          <Block>
            <InlineAlert tone="error" title="E-mail não encontrado na base de compradores.">
              Use o mesmo e-mail da compra. Pix e cartão liberam em poucos minutos; boleto pode levar até 3 dias úteis.
            </InlineAlert>
            {checkoutUrl && (
              <BuyLink href={checkoutUrl} target="_blank" rel="noopener noreferrer" onClick={() => play('tap')}>
                <ShoppingBag size={20} aria-hidden="true" />
                {buyLabel}
              </BuyLink>
            )}
          </Block>
        )}

        {!isSuccess && stage !== 'not-found' && checkoutUrl && (
          <BuyHint>
            Ainda não tem acesso?{' '}
            <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
              {buyLabel}
            </a>
          </BuyHint>
        )}

        <Note id={formHintId}>
          O e-mail serve só para conferir a compra e fica salvo neste aparelho para manter o acesso.
        </Note>
      </Card>
      <LiveRegion role="status">{isSuccess ? 'Acesso liberado. Abrindo o app.' : ''}</LiveRegion>
      <ConfettiCanvas ref={canvasRef} aria-hidden="true" />
    </Screen>
  );
}
