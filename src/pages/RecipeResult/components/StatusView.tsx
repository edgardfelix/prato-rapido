import { CircleAlert, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import * as S from '../styles';

interface StatusAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
}

interface StatusViewProps {
  tone: 'error' | 'empty';
  title: string;
  message?: string;
  primaryAction: StatusAction;
  secondaryAction?: StatusAction;
}

/** Full-page error / empty state with up to two actions. */
export function StatusView({ tone, title, message, primaryAction, secondaryAction }: StatusViewProps) {
  const Icon = tone === 'error' ? CircleAlert : UtensilsCrossed;
  const PrimaryIcon = primaryAction.icon;

  return (
    <S.Status role={tone === 'error' ? 'alert' : undefined}>
      <S.StatusIcon $tone={tone} aria-hidden="true">
        <Icon size={28} />
      </S.StatusIcon>
      <S.StatusTitle>{title}</S.StatusTitle>
      {message && <S.StatusMessage>{message}</S.StatusMessage>}
      <S.StatusActions>
        <Button size="lg" fullWidth leftIcon={PrimaryIcon && <PrimaryIcon size={18} />} onClick={primaryAction.onClick}>
          {primaryAction.label}
        </Button>
        {secondaryAction && (
          <Button size="lg" variant="ghost" fullWidth onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </S.StatusActions>
    </S.Status>
  );
}
