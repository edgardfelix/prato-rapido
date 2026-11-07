import { createContext } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface ToastOptions {
  /** Toasts sharing an id replace each other instead of piling up (e.g. every auto-save). */
  id?: string;
  title: string;
  description?: string;
  /** Defaults to a check mark (success) or an alert sign (error). */
  icon?: LucideIcon;
  /** "error" paints the badge red, for friendly failure messages. */
  tone?: 'success' | 'error';
  /** "bottom" (default) sits above the tab bar; "top" is for screens without it, where a bottom toast would cover the actions. */
  placement?: 'bottom' | 'top';
}

export interface ActiveToast extends ToastOptions {
  /** Increments on every `notify`, restarting the visibility timer. */
  seq: number;
  isLeaving: boolean;
}

export interface ToastContextValue {
  /** Shows a short confirmation above the tab bar (it never blocks taps). */
  notify: (toast: ToastOptions) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
