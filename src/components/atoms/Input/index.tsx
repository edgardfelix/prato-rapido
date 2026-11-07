import { useId, type ComponentPropsWithRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import * as S from './styles';

export interface InputProps extends ComponentPropsWithRef<'input'> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  hint?: string;
}

/** Labeled text field. Font size stays at 16px so iOS does not zoom on focus. */
export function Input({ label, icon: Icon, error, hint, id, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;

  return (
    <S.Field>
      <S.Label htmlFor={inputId}>{label}</S.Label>
      <S.Control $hasError={Boolean(error)}>
        {Icon && (
          <S.IconSlot aria-hidden="true">
            <Icon size={18} />
          </S.IconSlot>
        )}
        <S.InputElement
          id={inputId}
          $hasIcon={Boolean(Icon)}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          {...rest}
        />
      </S.Control>
      {message && (
        <S.Message id={messageId} $isError={Boolean(error)}>
          {message}
        </S.Message>
      )}
    </S.Field>
  );
}
