import type { ReactNode } from 'react';
import { CircleAlert, CircleCheck, Info, TriangleAlert, X, type LucideIcon } from 'lucide-react';
import * as S from './styles';

export type AlertTone = 'error' | 'warning' | 'info' | 'success';

const ICONS: Record<AlertTone, LucideIcon> = {
  error: CircleAlert,
  warning: TriangleAlert,
  info: Info,
  success: CircleCheck,
};

interface InlineAlertProps {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
}

export function InlineAlert({ tone = 'info', title, children, action, onDismiss }: InlineAlertProps) {
  const Icon = ICONS[tone];

  return (
    <S.Root $tone={tone} role={tone === 'error' ? 'alert' : 'status'}>
      <S.IconSlot $tone={tone} aria-hidden="true">
        <Icon size={18} />
      </S.IconSlot>
      <S.Body>
        {title && <S.Title>{title}</S.Title>}
        <S.Text>{children}</S.Text>
        {action && <S.Action>{action}</S.Action>}
      </S.Body>
      {onDismiss && (
        <S.Dismiss type="button" aria-label="Fechar aviso" onClick={onDismiss}>
          <X size={16} />
        </S.Dismiss>
      )}
    </S.Root>
  );
}
