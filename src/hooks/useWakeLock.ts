import { useEffect, useRef, useState } from 'react';

export type WakeLockStatus = 'unsupported' | 'idle' | 'active' | 'denied';

const isWakeLockSupported = () => typeof navigator !== 'undefined' && 'wakeLock' in navigator;

/**
 * Screen Wake Lock API: keeps the display on while `enabled` is true.
 * Browsers release the lock when the page is hidden, so it is re-acquired
 * every time the page becomes visible again.
 */
export function useWakeLock(enabled: boolean): WakeLockStatus {
  const supported = isWakeLockSupported();
  const [status, setStatus] = useState<WakeLockStatus>(supported ? 'idle' : 'unsupported');
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!enabled || !supported) return;
    let cancelled = false;

    const acquire = async () => {
      if (document.visibilityState !== 'visible' || sentinelRef.current) return;
      try {
        const sentinel = await navigator.wakeLock.request('screen');
        if (cancelled) {
          void sentinel.release().catch(() => undefined);
          return;
        }
        sentinelRef.current = sentinel;
        setStatus('active');
        sentinel.addEventListener('release', () => {
          if (sentinelRef.current === sentinel) sentinelRef.current = null;
          if (!cancelled) setStatus('idle');
        });
      } catch {
        // e.g. battery saver mode or a browser policy refused the lock.
        if (!cancelled) setStatus('denied');
      }
    };

    void acquire();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void acquire();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      const sentinel = sentinelRef.current;
      sentinelRef.current = null;
      void sentinel?.release().catch(() => undefined);
      setStatus('idle');
    };
  }, [enabled, supported]);

  return supported ? status : 'unsupported';
}
