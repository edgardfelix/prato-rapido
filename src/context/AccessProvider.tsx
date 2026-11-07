import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import type { AccessGrant, AccessStatusResponse } from '@/@types';
import { ACCESS_FLAG_KEY, STORAGE_KEYS } from '@/constants/storage';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { accessService } from '@/services/accessService';
import { registerAccess } from '@/services/httpClient';
import { sanitizeAccessGrant, sanitizePaywallStatus } from '@/utils/validators';
import { AccessContext, type AccessContextValue, type AccessState } from './AccessContext';

const DEFAULT_PRICE_LABEL = 'R$ 21,90';
/** Tokens closer than this to their expiry are renewed silently with the saved purchase e-mail. */
const RENEW_BEFORE_MS = 15 * 24 * 60 * 60_000;

function readFlag(): boolean {
  try {
    return window.localStorage.getItem(ACCESS_FLAG_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeFlag(granted: boolean): void {
  try {
    if (granted) window.localStorage.setItem(ACCESS_FLAG_KEY, 'true');
    else window.localStorage.removeItem(ACCESS_FLAG_KEY);
  } catch {
    // Storage unavailable (private mode): the in-memory state still works for this visit.
  }
}

/**
 * Paid access (Cakto + Upstash). The device is unlocked when it holds the
 * `prato_rapido_access` flag and a valid signed token. Those only skip the
 * activation screen: the server checks the token on every AI request, so
 * editing localStorage unlocks the screens but never the paid features.
 */
export function AccessProvider({ children }: PropsWithChildren) {
  const [grant, setGrant, removeGrant] = useLocalStorage<AccessGrant | null>(STORAGE_KEYS.access, null, sanitizeAccessGrant);
  const [paywall, setPaywall] = useLocalStorage<AccessStatusResponse | null>(STORAGE_KEYS.paywall, null, sanitizePaywallStatus);
  const [flag, setFlag] = useState(readFlag);
  const [statusError, setStatusError] = useState(false);
  const [statusRequest, setStatusRequest] = useState(0);
  const [lockMessage, setLockMessage] = useState<string | null>(null);
  const tokenRef = useRef<string | null>(grant?.token ?? null);
  const renewedRef = useRef(false);

  const hasLocalAccess = flag && grant !== null;

  useLayoutEffect(() => {
    tokenRef.current = hasLocalAccess ? (grant?.token ?? null) : null;
  });

  const grantAccess = useCallback(
    (next: AccessGrant) => {
      tokenRef.current = next.token;
      setGrant(next);
      writeFlag(true);
      setFlag(true);
      setLockMessage(null);
    },
    [setGrant],
  );

  const lock = useCallback(
    (message: string | null) => {
      tokenRef.current = null;
      removeGrant();
      writeFlag(false);
      setFlag(false);
      setLockMessage(message);
      // The server just proved it has a paywall: show the activation screen right away.
      setPaywall((current) => ({
        enabled: true,
        checkoutUrl: current?.checkoutUrl ?? null,
        priceLabel: current?.priceLabel ?? DEFAULT_PRICE_LABEL,
      }));
    },
    [removeGrant, setPaywall],
  );

  const signOut = useCallback(() => lock(null), [lock]);
  const retryStatus = useCallback(() => {
    setStatusError(false);
    setStatusRequest((count) => count + 1);
  }, []);

  // Without local access, ask the server whether there is a paywall (cached answer shown meanwhile).
  useEffect(() => {
    if (hasLocalAccess) return;
    const controller = new AbortController();
    accessService.getStatus(controller.signal).then(
      (response) => {
        if (controller.signal.aborted) return;
        const status = sanitizePaywallStatus(response, null);
        if (status) setPaywall(status);
        setStatusError(status === null);
      },
      () => {
        if (!controller.signal.aborted) setStatusError(true);
      },
    );
    return () => controller.abort();
  }, [hasLocalAccess, statusRequest, setPaywall]);

  // Near its expiry the token is renewed with the saved e-mail; a refunded purchase locks the device.
  useEffect(() => {
    if (!hasLocalAccess || !grant || renewedRef.current) return;
    if (Date.parse(grant.expiresAt) - Date.now() > RENEW_BEFORE_MS) return;
    renewedRef.current = true;
    accessService.verifyEmail({ email: grant.email }).then(
      (result) => {
        if (result.success) grantAccess({ email: grant.email, token: result.accessToken, expiresAt: result.expiresAt });
        else lock('Não encontramos mais a compra deste e-mail. Confira o e-mail usado na Cakto.');
      },
      () => undefined, // Offline: keep the current token and try again on the next visit.
    );
  }, [hasLocalAccess, grant, grantAccess, lock]);

  // Another tab activated or signed out.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === ACCESS_FLAG_KEY) setFlag(readFlag());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    registerAccess({
      getToken: () => tokenRef.current,
      onAccessLost: (message) => lock(message),
    });
    return () => registerAccess(null);
  }, [lock]);

  const state: AccessState = hasLocalAccess
    ? 'unlocked'
    : paywall
      ? paywall.enabled
        ? 'locked'
        : 'open'
      : statusError
        ? 'locked'
        : 'checking';

  const value = useMemo<AccessContextValue>(
    () => ({
      state,
      grant: hasLocalAccess ? grant : null,
      checkoutUrl: paywall?.checkoutUrl ?? null,
      priceLabel: paywall?.priceLabel ?? DEFAULT_PRICE_LABEL,
      lockMessage,
      statusError,
      grantAccess,
      signOut,
      retryStatus,
    }),
    [state, hasLocalAccess, grant, paywall, lockMessage, statusError, grantAccess, signOut, retryStatus],
  );

  return <AccessContext value={value}>{children}</AccessContext>;
}
