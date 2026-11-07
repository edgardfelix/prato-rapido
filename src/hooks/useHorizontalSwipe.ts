import { useEffect, useLayoutEffect, useRef } from 'react';

interface SwipeOptions {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  canSwipeLeft: boolean;
  canSwipeRight: boolean;
}

const AXIS_LOCK_PX = 8;
const EDGE_RESISTANCE = 0.3;

/**
 * Pointer-driven horizontal swipe. The finger offset is written to the
 * track's `--drag` CSS variable (no React render per move) and
 * `data-dragging` disables the snap transition while the finger is down.
 * Vertical gestures are left to the browser (`touch-action: pan-y`).
 */
export function useHorizontalSwipe<TViewport extends HTMLElement, TTrack extends HTMLElement>(options: SwipeOptions) {
  const viewportRef = useRef<TViewport>(null);
  const trackRef = useRef<TTrack>(null);
  const optionsRef = useRef(options);

  useLayoutEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    let pointerId: number | null = null;
    let startX = 0;
    let startY = 0;
    let deltaX = 0;
    let axis: 'x' | 'y' | null = null;

    const setDrag = (pixels: number) => track.style.setProperty('--drag', `${pixels}px`);

    const handleDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      deltaX = 0;
      axis = null;
    };

    const handleMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (!axis) {
        if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return;
        axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (axis === 'x') {
          track.dataset.dragging = 'true';
          try {
            viewport.setPointerCapture(event.pointerId);
          } catch {
            // The pointer may already be gone; the swipe still works without capture.
          }
        }
      }
      if (axis !== 'x') return;
      const { canSwipeLeft, canSwipeRight } = optionsRef.current;
      const atEdge = (dx < 0 && !canSwipeLeft) || (dx > 0 && !canSwipeRight);
      deltaX = atEdge ? dx * EDGE_RESISTANCE : dx;
      setDrag(deltaX);
    };

    const finish = (event: PointerEvent, commit: boolean) => {
      if (event.pointerId !== pointerId) return;
      pointerId = null;
      if (axis === 'x') {
        delete track.dataset.dragging;
        if (commit) {
          const threshold = Math.min(90, viewport.clientWidth * 0.18);
          const { canSwipeLeft, canSwipeRight, onSwipeLeft, onSwipeRight } = optionsRef.current;
          if (deltaX < -threshold && canSwipeLeft) onSwipeLeft();
          else if (deltaX > threshold && canSwipeRight) onSwipeRight();
        }
        setDrag(0);
      }
      axis = null;
    };
    const handleUp = (event: PointerEvent) => finish(event, true);
    // The browser took the gesture over (e.g. it started scrolling): snap back without navigating.
    const handleCancel = (event: PointerEvent) => finish(event, false);

    viewport.addEventListener('pointerdown', handleDown);
    viewport.addEventListener('pointermove', handleMove);
    viewport.addEventListener('pointerup', handleUp);
    viewport.addEventListener('pointercancel', handleCancel);
    return () => {
      viewport.removeEventListener('pointerdown', handleDown);
      viewport.removeEventListener('pointermove', handleMove);
      viewport.removeEventListener('pointerup', handleUp);
      viewport.removeEventListener('pointercancel', handleCancel);
    };
  }, []);

  return { viewportRef, trackRef };
}
