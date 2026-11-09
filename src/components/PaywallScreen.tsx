import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LockKeyhole,
  LogIn,
  Mail,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import styled, { css } from 'styled-components';
import type { SessionResponse } from '@/@types';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { BrandLogo } from '@/components/molecules/BrandLogo';
import { InlineAlert } from '@/components/molecules/InlineAlert';
import { useAccess } from '@/hooks/useAccess';
import { useSound } from '@/hooks/useSound';
import { useToast } from '@/hooks/useToast';
import { accessService } from '@/services/accessService';
import { ApiClientError, getErrorMessage } from '@/services/httpClient';
import { fadeInUp, medalPop, pulseRing } from '@/styles/animations';
import { cardSurface, pressable, visuallyHidden } from '@/styles/mixins';
import { EMAIL_MAX_LENGTH, isValidEmail, normalizeEmail } from '@/utils/email';
import { prefersReducedMotion } from '@/utils/motion';

/** How long the "Acesso liberado!" moment stays before the app opens. */
const SUCCESS_MS = 1_600;
/** Same rule as the server (it also refuses passwords that are too easy to guess). */
const PASSWORD_MIN_CHARS = 8;
const PASSWORD_MAX_CHARS = 128;

/** e-mail → first access (create the password) or sign in (type it) → success. */
type Step = 'email' | 'setup' | 'login' | 'success';

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
  overflow-wrap: anywhere;

  strong {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const Form = styled.form`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 14px;
  margin-top: 4px;
  text-align: left;
  animation: ${fadeInUp} 320ms ${({ theme }) => theme.motion.easeOut} both;
`;

const Block = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 12px;
  text-align: left;
  animation: ${fadeInUp} 320ms ${({ theme }) => theme.motion.easeOut} both;
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

/** Checkout link with the brand orange, so the purchase stands apart from the main action. */
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

/** Lets password managers pair the password with the account e-mail. */
const HiddenUsername = styled.input`
  ${visuallyHidden}
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

const COPY: Record<Step, { title: string; announce: string }> = {
  email: { title: 'Ative seu Acesso ao Prato Rápido', announce: '' },
  setup: { title: 'Defina sua senha de acesso', announce: 'Primeiro acesso: defina sua senha.' },
  login: { title: 'Digite sua senha', announce: 'Digite sua senha para entrar.' },
  success: { title: 'Acesso liberado!', announce: 'Acesso liberado. Abrindo o app.' },
};

/**
 * Sign-in for buyers. Step 1: the Cakto purchase e-mail (the server checks the
 * purchase). Step 2: on the first access the buyer creates a password; later
 * the password is required. The server answers with an HttpOnly session cookie.
 * Shown by AccessGate instead of the app while locked.
 */
export function PaywallScreen() {
  const { grantAccess, checkoutUrl, priceLabel, lockMessage, statusError, retryStatus } = useAccess();
  const { notify } = useToast();
  const { play, haptic } = useSound();
  const formHintId = useId();
  const [step, setStep] = useState<Step>('email');
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  /** The checked purchase e-mail, used by the password steps. */
  const [account, setAccount] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmationError, setConfirmationError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const stopConfettiRef = useRef<(() => void) | null>(null);

  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current);
      stopConfettiRef.current?.();
    },
    [],
  );

  // Each password step starts in its password field.
  useEffect(() => {
    if (step === 'setup' || step === 'login') passwordRef.current?.focus();
  }, [step]);

  const fail = (title: string, description: string) => {
    play('error');
    haptic('error');
    notify({ id: 'paywall', tone: 'error', placement: 'top', title, description });
  };

  const celebrate = () => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion()) return;
    // The confetti lives in the celebration chunk: loaded only for this moment.
    void import('@/components/modals/CelebrationModal/confetti').then(({ launchConfetti, readConfettiColors }) => {
      stopConfettiRef.current = launchConfetti(canvas, { colors: readConfettiColors(), origin: { x: 0.5, y: 0.3 }, count: 120 });
    });
  };

  const resetPasswords = () => {
    setPassword('');
    setConfirmation('');
    setPasswordError(null);
    setConfirmationError(null);
  };

  const goToPasswordStep = (next: 'setup' | 'login') => {
    resetPasswords();
    setStep(next);
  };

  const backToEmail = (purchaseMissing = false) => {
    resetPasswords();
    setShowPassword(false);
    setNotFound(purchaseMissing);
    setStep('email');
  };

  const succeed = (session: SessionResponse) => {
    setStep('success');
    play('celebrate');
    haptic('celebrate');
    celebrate();
    timerRef.current = window.setTimeout(() => grantAccess({ v: 2, email: session.email, expiresAt: session.expiresAt }), SUCCESS_MS);
  };

  const handleNoPurchase = () => {
    backToEmail(true);
    fail('E-mail não encontrado', 'Confira o e-mail usado na Cakto ou garanta seu acesso.');
  };

  const submitEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const normalized = normalizeEmail(email);
    if (!isValidEmail(normalized)) {
      setEmailError('Digite um e-mail válido, como nome@email.com.');
      event.currentTarget.querySelector('input')?.focus();
      return;
    }

    setEmailError(null);
    setNotFound(false);
    setBusy(true);
    try {
      const { isFirstAccess } = await accessService.verifyEmail({ email: normalized });
      setAccount(normalized);
      play('tap');
      goToPasswordStep(isFirstAccess ? 'setup' : 'login');
    } catch (error) {
      if (error instanceof ApiClientError && error.code === 'NO_PURCHASE') handleNoPurchase();
      else fail('Não deu para verificar agora', getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const submitSetup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    if (password.length < PASSWORD_MIN_CHARS) {
      setPasswordError(`Use pelo menos ${PASSWORD_MIN_CHARS} caracteres.`);
      passwordRef.current?.focus();
      return;
    }
    if (password !== confirmation) {
      setConfirmationError('As senhas não são iguais.');
      return;
    }

    setBusy(true);
    try {
      succeed(await accessService.setupPassword({ email: account, password }));
    } catch (error) {
      if (error instanceof ApiClientError && (error.code === 'WEAK_PASSWORD' || error.code === 'BAD_REQUEST')) {
        setPasswordError(error.message);
        play('error');
        passwordRef.current?.focus();
      } else if (error instanceof ApiClientError && error.code === 'PASSWORD_ALREADY_SET') {
        goToPasswordStep('login');
        notify({ id: 'paywall', placement: 'top', icon: Lock, title: 'Este e-mail já tem senha', description: 'Entre com a senha cadastrada.' });
      } else if (error instanceof ApiClientError && error.code === 'NO_PURCHASE') {
        handleNoPurchase();
      } else {
        fail('Não deu para salvar a senha', getErrorMessage(error));
      }
    } finally {
      setBusy(false);
    }
  };

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    if (!password) {
      setPasswordError('Digite a sua senha.');
      passwordRef.current?.focus();
      return;
    }

    setBusy(true);
    try {
      succeed(await accessService.login({ email: account, password }));
    } catch (error) {
      if (error instanceof ApiClientError && error.code === 'INVALID_PASSWORD') {
        setPasswordError(error.message);
        fail('Senha incorreta', 'Confira a senha e tente de novo.');
        passwordRef.current?.select();
      } else if (error instanceof ApiClientError && error.code === 'RATE_LIMITED') {
        setPasswordError(error.message);
        fail('Acesso pausado por alguns minutos', error.message);
      } else if (error instanceof ApiClientError && error.code === 'PASSWORD_NOT_SET') {
        goToPasswordStep('setup');
      } else if (error instanceof ApiClientError && error.code === 'NO_PURCHASE') {
        handleNoPurchase();
      } else {
        fail('Não deu para entrar agora', getErrorMessage(error));
      }
    } finally {
      setBusy(false);
    }
  };

  const isSuccess = step === 'success';
  const isPasswordStep = step === 'setup' || step === 'login';
  const buyLabel = `Comprar Acesso (${priceLabel})`;
  const passwordType = showPassword ? 'text' : 'password';
  const MedalIcon = isSuccess ? Check : step === 'setup' ? LockKeyhole : step === 'login' ? Lock : KeyRound;

  const passwordTools = (
    <Row>
      <Button type="button" size="sm" variant="ghost" leftIcon={<ArrowLeft size={16} />} onClick={() => backToEmail()} disabled={busy}>
        Trocar e-mail
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        aria-pressed={showPassword}
        leftIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        onClick={() => setShowPassword((current) => !current)}
      >
        {showPassword ? 'Esconder senha' : 'Mostrar senha'}
      </Button>
    </Row>
  );

  return (
    <Screen>
      <BrandLogo />
      <Card aria-labelledby="paywall-title">
        <Medal $success={isSuccess} aria-hidden="true">
          <MedalIcon size={isSuccess ? 34 : 30} strokeWidth={isSuccess ? 3 : 2} />
        </Medal>
        <Title id="paywall-title">{COPY[step].title}</Title>
        <Subtitle>
          {step === 'email' && 'Digite o e-mail utilizado na compra na Cakto para liberar o app neste aparelho.'}
          {step === 'setup' && (
            <>
              Primeiro acesso de <strong>{account}</strong>. Crie uma senha: ela será pedida sempre que você entrar em um
              aparelho.
            </>
          )}
          {step === 'login' && (
            <>
              Entrando como <strong>{account}</strong>.
            </>
          )}
          {isSuccess && 'Tudo certo com a sua compra. Abrindo o Prato Rápido…'}
        </Subtitle>

        {step === 'email' && lockMessage && (
          <Block>
            <InlineAlert tone="warning" title="Entre de novo">
              {lockMessage}
            </InlineAlert>
          </Block>
        )}

        {step === 'email' && statusError && (
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

        {step === 'email' && (
          <Form onSubmit={submitEmail} noValidate aria-describedby={formHintId}>
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
                if (emailError) setEmailError(null);
                if (notFound) setNotFound(false);
              }}
              error={emailError ?? undefined}
            />
            <Button type="submit" size="lg" fullWidth isLoading={busy} leftIcon={<ShieldCheck size={20} />}>
              Verificar Acesso
            </Button>
          </Form>
        )}

        {step === 'setup' && (
          <Form key="setup" onSubmit={submitSetup} noValidate>
            <HiddenUsername type="email" name="username" autoComplete="username" value={account} readOnly tabIndex={-1} aria-hidden="true" />
            <Input
              ref={passwordRef}
              label="Senha"
              icon={LockKeyhole}
              name="new-password"
              type={passwordType}
              autoComplete="new-password"
              autoCapitalize="off"
              spellCheck={false}
              maxLength={PASSWORD_MAX_CHARS}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (passwordError) setPasswordError(null);
              }}
              hint={`Mínimo de ${PASSWORD_MIN_CHARS} caracteres. Evite datas e sequências como 12345678.`}
              error={passwordError ?? undefined}
            />
            <Input
              label="Confirmar senha"
              icon={LockKeyhole}
              name="confirm-password"
              type={passwordType}
              autoComplete="new-password"
              autoCapitalize="off"
              spellCheck={false}
              maxLength={PASSWORD_MAX_CHARS}
              value={confirmation}
              onChange={(event) => {
                setConfirmation(event.target.value);
                if (confirmationError) setConfirmationError(null);
              }}
              error={confirmationError ?? undefined}
            />
            {passwordTools}
            <Button type="submit" size="lg" fullWidth isLoading={busy} leftIcon={<ShieldCheck size={20} />}>
              Salvar e entrar
            </Button>
          </Form>
        )}

        {step === 'login' && (
          <Form key="login" onSubmit={submitLogin} noValidate>
            <HiddenUsername type="email" name="username" autoComplete="username" value={account} readOnly tabIndex={-1} aria-hidden="true" />
            <Input
              ref={passwordRef}
              label="Senha"
              icon={Lock}
              name="current-password"
              type={passwordType}
              autoComplete="current-password"
              autoCapitalize="off"
              spellCheck={false}
              maxLength={PASSWORD_MAX_CHARS}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (passwordError) setPasswordError(null);
              }}
              error={passwordError ?? undefined}
            />
            {passwordTools}
            <Button type="submit" size="lg" fullWidth isLoading={busy} leftIcon={<LogIn size={20} />}>
              Entrar
            </Button>
          </Form>
        )}

        {step === 'email' && notFound && (
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

        {step === 'email' && !notFound && checkoutUrl && (
          <BuyHint>
            Ainda não tem acesso?{' '}
            <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
              {buyLabel}
            </a>
          </BuyHint>
        )}

        {!isSuccess && (
          <Note id={formHintId}>
            {isPasswordStep
              ? step === 'login'
                ? 'Esqueceu a senha? Fale com o suporte da sua compra para liberar uma nova.'
                : 'Guarde a senha: sem envio de e-mail, só o suporte consegue liberar uma nova.'
              : 'O e-mail confere a sua compra e a senha protege o seu acesso, neste e em outros aparelhos.'}
          </Note>
        )}
      </Card>
      <LiveRegion role="status">{COPY[step].announce}</LiveRegion>
      <ConfettiCanvas ref={canvasRef} aria-hidden="true" />
    </Screen>
  );
}
