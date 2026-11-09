import { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import type { AccessGrant, AccessStatusResponse } from '@/@types';
import { ACCESS_FLAG_KEY, STORAGE_KEYS } from '@/constants/storage';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { accessService } from '@/services/accessService';
import { ApiClientError, registerAccess } from '@/services/httpClient';
import { sanitizeAccessGrant, sanitizePaywallStatus } from '@/utils/validators';
import { AccessContext, type AccessContextValue, type AccessState } from './AccessContext';

const DEFAULT_PRICE_LABEL = 'R$ 21,90';

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
 * Paid access (Cakto + Upstash). Signing in (e-mail + password) makes the
 * server set an HttpOnly session cookie that page scripts never see; this
 * device only keeps the `prato_rapido_access` flag plus the e-mail and the
 * session expiry, to skip the sign-in screen. The server checks the cookie on
 * every AI request, and once per visit the app asks whether the session still
 * holds (refund, new password, expiry), which also extends it.
 */
export function AccessProvider({ children }: PropsWithChildren) {
  const [grant, setGrant, removeGrant] = useLocalStorage<AccessGrant | null>(STORAGE_KEYS.access, null, sanitizeAccessGrant);
  const [paywall, setPaywall] = useLocalStorage<AccessStatusResponse | null>(STORAGE_KEYS.paywall, null, sanitizePaywallStatus);
  const [flag, setFlag] = useState(readFlag);
  const [statusError, setStatusError] = useState(false);
  const [statusRequest, setStatusRequest] = useState(0);
  const [lockMessage, setLockMessage] = useState<string | null>(null);
  /** The session was confirmed during this visit (just signed in, or checked with the server). */
  const sessionCheckedRef = useRef(false);

  const hasLocalAccess = flag && grant !== null;

  const grantAccess = useCallback(
    (next: AccessGrant) => {
      sessionCheckedRef.current = true;
      setGrant(next);
      writeFlag(true);
      setFlag(true);
      setLockMessage(null);
    },
    [setGrant],
  );

  const lock = useCallback(
    (message: string | null) => {
      removeGrant();
      writeFlag(false);
      setFlag(false);
      setLockMessage(message);
      // The server just proved it has a paywall: show the sign-in screen right away.
      setPaywall((current) => ({
        enabled: true,
        checkoutUrl: current?.checkoutUrl ?? null,
        priceLabel: current?.priceLabel ?? DEFAULT_PRICE_LABEL,
      }));
    },
    [removeGrant, setPaywall],
  );

  const signOut = useCallback(() => {
    // Only the server can remove an HttpOnly cookie.
    void accessService.logout().catch(() => undefined);
    sessionCheckedRef.current = false;
    lock(null);
  }, [lock]);

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

  // Once per visit: does the session cookie still hold? 401 locks the app; offline keeps it (the AI routes still check).
  useEffect(() => {
    if (!hasLocalAccess || sessionCheckedRef.current) return;
    sessionCheckedRef.current = true;
    const controller = new AbortController();
    accessService.getSession(controller.signal).then(
      (session) => {
        setGrant((current) => (current && current.expiresAt !== session.expiresAt ? { ...current, expiresAt: session.expiresAt } : current));
      },
      (error: unknown) => {
        if (error instanceof ApiClientError && error.status === 401) lock(error.message);
      },
    );
    return () => {
      controller.abort();
      sessionCheckedRef.current = false;
    };
  }, [hasLocalAccess, lock, setGrant]);

  // Another tab signed in or out.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === ACCESS_FLAG_KEY) setFlag(readFlag());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    registerAccess({ onAccessLost: (message) => lock(message) });
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
