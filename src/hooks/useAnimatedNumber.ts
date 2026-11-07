import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Tweens a number towards `target` with requestAnimationFrame (ease-out).
 * Use it inside a tiny component so only that text re-renders per frame.
 */
export function useAnimatedNumber(target: number, { durationMs = 800, fromZero = false } = {}): number {
  const [value, setValue] = useState(() => (fromZero && !prefersReducedMotion() ? 0 : target));
  const valueRef = useRef(value);

  useEffect(() => {
    const from = valueRef.current;
    if (from === target) return;
    // Reduced motion: jump straight to the value (still applied on the next frame).
    const duration = prefersReducedMotion() ? 0 : durationMs;

    let frame = 0;
    const startedAt = performance.now();
    const step = (now: number) => {
      const progress = duration === 0 ? 1 : Math.min(1, (now - startedAt) / duration);
      const eased = 1 - (1 - progress) ** 3;
      const next = Math.round(from + (target - from) * eased);
      valueRef.current = next;
      setValue(next);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}
