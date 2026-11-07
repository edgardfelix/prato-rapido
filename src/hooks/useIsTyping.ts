import { useEffect, useState } from 'react';

const NON_TEXT_INPUTS = new Set(['checkbox', 'radio', 'button', 'submit', 'reset', 'file', 'range', 'color', 'image']);

const isTextField = (target: EventTarget | null): boolean =>
  target instanceof HTMLTextAreaElement ||
  (target instanceof HTMLInputElement && !NON_TEXT_INPUTS.has(target.type)) ||
  (target instanceof HTMLElement && target.isContentEditable);

/**
 * True while a text field is focused on a touch device, i.e. while the
 * on-screen keyboard is likely open (used to tuck the bottom bar away).
 */
export function useIsTyping(): boolean {
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const isTouch = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
    if (!isTouch) return;
    const handleFocusIn = (event: FocusEvent) => setIsTyping(isTextField(event.target));
    const handleFocusOut = (event: FocusEvent) => setIsTyping(isTextField(event.relatedTarget));
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return isTyping;
}
