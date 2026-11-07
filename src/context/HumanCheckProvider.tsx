import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import type { HumanVerification } from '@/@types';
import { HumanChallengePanel } from '@/components/modals/HumanChallenge';
import { Modal } from '@/components/organisms/Modal';
import { STORAGE_KEYS } from '@/constants/storage';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { registerHumanCheck } from '@/services/httpClient';
import { sanitizeVerification } from '@/utils/validators';
import { HumanCheckContext, type HumanCheckContextValue } from './HumanCheckContext';

interface PendingVerification {
  promise: Promise<boolean>;
  resolve: (solved: boolean) => void;
}

/**
 * Owns the signed verification token (localStorage, 30 days) and the
 * "Verificação rápida" sheet. The HTTP client asks for a new check through the
 * registered bridge whenever the server answers CHALLENGE_REQUIRED; requests
 * made in the meantime share the same sheet and are retried once it is solved.
 */
export function HumanCheckProvider({ children }: PropsWithChildren) {
  const [verification, setVerification] = useLocalStorage<HumanVerification | null>(
    STORAGE_KEYS.verification,
    null,
    sanitizeVerification,
  );
  const [isDeferred, setIsDeferred] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);
  const tokenRef = useRef<string | null>(verification?.token ?? null);
  const pendingRef = useRef<PendingVerification | null>(null);

  useLayoutEffect(() => {
    tokenRef.current = verification?.token ?? null;
  });

  const completeVerification = useCallback(
    (next: HumanVerification) => {
      tokenRef.current = next.token; // available to the retry before the next render
      setVerification(next);
      setIsDeferred(false);
    },
    [setVerification],
  );

  const deferVerification = useCallback(() => setIsDeferred(true), []);

  const settle = useCallback((solved: boolean) => {
    const pending = pendingRef.current;
    pendingRef.current = null;
    setIsPrompting(false);
    pending?.resolve(solved);
  }, []);

  useEffect(() => {
    registerHumanCheck({
      getToken: () => tokenRef.current,
      requestVerification: () => {
        if (!pendingRef.current) {
          let resolve: (solved: boolean) => void = () => undefined;
          const promise = new Promise<boolean>((done) => {
            resolve = done;
          });
          pendingRef.current = { promise, resolve };
          setIsPrompting(true);
        }
        return pendingRef.current.promise;
      },
    });
    return () => {
      registerHumanCheck(null);
      pendingRef.current?.resolve(false);
      pendingRef.current = null;
    };
  }, []);

  const handleSheetVerified = useCallback(
    (next: HumanVerification) => {
      completeVerification(next);
      settle(true);
    },
    [completeVerification, settle],
  );

  const value = useMemo<HumanCheckContextValue>(
    () => ({ isVerified: verification !== null, isDeferred, completeVerification, deferVerification }),
    [verification, isDeferred, completeVerification, deferVerification],
  );

  return (
    <HumanCheckContext value={value}>
      {children}
      <Modal
        isOpen={isPrompting}
        onClose={() => settle(false)}
        title="Verificação rápida"
        description="Por segurança, confirme que você não é um robô. Seu pedido continua logo depois."
      >
        <HumanChallengePanel layout="sheet" onVerified={handleSheetVerified} />
      </Modal>
    </HumanCheckContext>
  );
}
