import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Open dialogs, newest last: only the top one handles Tab and Escape (dialogs can stack). */
const trapStack: symbol[] = [];

/**
 * Keeps keyboard focus inside `containerRef` while mounted, closes on Escape
 * and restores focus to the element that opened it.
 */
export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, onEscape?: () => void) {
  const onEscapeRef = useRef(onEscape);

  useLayoutEffect(() => {
    onEscapeRef.current = onEscape;
  });

  useEffect(() => {
    const id = Symbol('focus-trap');
    trapStack.push(id);
    const container = containerRef.current;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    container?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (trapStack[trapStack.length - 1] !== id || !container) return;
      if (event.key === 'Escape') {
        event.stopPropagation();
        onEscapeRef.current?.();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        event.preventDefault();
        return;
      }
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === container)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (!container.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      trapStack.splice(trapStack.indexOf(id), 1);
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [containerRef]);
}
