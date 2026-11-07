import { useLayoutEffect, type RefObject } from 'react';

/** Grows a textarea with its content between a minimum and a maximum height. */
export function useAutoResizeTextarea(
  ref: RefObject<HTMLTextAreaElement | null>,
  value: string,
  maxHeightPx = 220,
) {
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.height = 'auto';
    const nextHeight = Math.min(element.scrollHeight, maxHeightPx);
    element.style.height = `${nextHeight}px`;
    element.style.overflowY = element.scrollHeight > maxHeightPx ? 'auto' : 'hidden';
  }, [ref, value, maxHeightPx]);
}
