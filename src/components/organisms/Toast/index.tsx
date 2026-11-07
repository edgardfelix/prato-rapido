import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, CircleAlert } from 'lucide-react';
import type { ActiveToast } from '@/context/ToastContext';
import * as S from './styles';

const VISIBLE_MS = 2_400;

interface ToastProps {
  toast: ActiveToast | null;
  onDismiss: (seq: number) => void;
}

/**
 * Snackbar above the tab bar. The live region stays mounted so screen readers
 * announce each new message; it ignores pointer events so it never covers a control.
 */
export function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!toast || toast.isLeaving) return;
    const timer = window.setTimeout(() => onDismiss(toast.seq), VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

  const tone = toast?.tone ?? 'success';
  const placement = toast?.placement ?? 'bottom';
  const Icon = toast?.icon ?? (tone === 'error' ? CircleAlert : Check);

  return createPortal(
    <S.Positioner role="status" aria-live="polite" $placement={placement}>
      {toast && (
        // Same id → same element: the text updates in place instead of re-entering.
        <S.Pill key={toast.id ?? toast.seq} $leaving={toast.isLeaving} $placement={placement}>
          {/* Keyed by seq so the badge "pops" again on every new save. */}
          <S.IconBadge key={toast.seq} $tone={tone} aria-hidden="true">
            <Icon size={15} strokeWidth={3} />
          </S.IconBadge>
          <S.Texts>
            <strong>{toast.title}</strong>
            {toast.description && <span>{toast.description}</span>}
          </S.Texts>
        </S.Pill>
      )}
    </S.Positioner>,
    document.body,
  );
}
