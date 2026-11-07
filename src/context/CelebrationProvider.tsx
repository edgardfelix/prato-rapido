import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import {
  CelebrationContext,
  type Celebration,
  type CelebrationContextValue,
  type CelebrationInput,
} from './CelebrationContext';

const MAX_QUEUED = 4;
const MAX_EXTRAS = 3;

// Never needed at startup: the modal + confetti load in their own chunk, prefetched once the app is idle.
const loadCelebrationModal = () => import('@/components/modals/CelebrationModal');
const CelebrationModal = lazy(() => loadCelebrationModal().then((module) => ({ default: module.CelebrationModal })));

/**
 * Shows celebrations (finished days, streaks, badges) one modal at a time.
 * Anything celebrated while a modal is still queued or open joins it as an
 * extra chip: a finished day and the badge it unlocks are one moment, even
 * when the badge is detected a few seconds later on a slow phone.
 */
export function CelebrationProvider({ children }: PropsWithChildren) {
  const [queue, setQueue] = useState<Celebration[]>([]);
  const nextIdRef = useRef(1);
  // The modal playing its exit animation no longer takes extras (they would vanish with it).
  const closingIdRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadCelebrationModal(), 4_000);
    return () => window.clearTimeout(timer);
  }, []);

  const celebrate = useCallback((input: CelebrationInput) => {
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    setQueue((current) => {
      const last = current.at(-1);
      if (last && last.id !== closingIdRef.current && last.extras.length < MAX_EXTRAS) {
        const extra = { icon: input.icon, title: input.title, tone: input.tone };
        return [...current.slice(0, -1), { ...last, extras: [...last.extras, extra] }];
      }
      return [...current, { ...input, id, extras: [] }].slice(-MAX_QUEUED);
    });
  }, []);

  const markClosing = useCallback((id: number) => {
    closingIdRef.current = id;
  }, []);

  const dismiss = useCallback((id: number) => {
    setQueue((current) => current.filter((item) => item.id !== id));
  }, []);

  const value = useMemo<CelebrationContextValue>(() => ({ celebrate }), [celebrate]);
  const current = queue[0] ?? null;

  return (
    <CelebrationContext value={value}>
      {children}
      {current && (
        <Suspense fallback={null}>
          <CelebrationModal celebration={current} onClosing={markClosing} onDismiss={dismiss} />
        </Suspense>
      )}
    </CelebrationContext>
  );
}
