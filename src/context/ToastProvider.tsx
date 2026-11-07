import { useCallback, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { Toast } from '@/components/organisms/Toast';
import { ToastContext, type ActiveToast, type ToastContextValue, type ToastOptions } from './ToastContext';

/** Matches the exit animation in the Toast styles. */
const EXIT_MS = 180;

/**
 * Lightweight confirmations ("Preferências salvas"). Unlike celebrations they
 * do not queue: a new toast replaces the current one, so a burst of quick
 * edits produces a single message whose timer restarts on each change.
 */
export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ActiveToast | null>(null);
  const seqRef = useRef(0);

  const notify = useCallback((options: ToastOptions) => {
    seqRef.current += 1;
    setToast({ ...options, seq: seqRef.current, isLeaving: false });
  }, []);

  const dismiss = useCallback((seq: number) => {
    setToast((current) => (current?.seq === seq ? { ...current, isLeaving: true } : current));
    window.setTimeout(() => setToast((current) => (current?.seq === seq ? null : current)), EXIT_MS);
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ notify }), [notify]);

  return (
    <ToastContext value={value}>
      {children}
      <Toast toast={toast} onDismiss={dismiss} />
    </ToastContext>
  );
}
