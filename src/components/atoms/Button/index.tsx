import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Spinner } from '../Spinner';
import * as S from './styles';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/** Pill button with tactile press feedback (scale 0.96) and a loading state. */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <S.Root
      type={type}
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading ? <Spinner size={size === 'sm' ? 16 : 18} /> : leftIcon}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </S.Root>
  );
}
