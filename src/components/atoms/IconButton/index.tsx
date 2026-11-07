import type { ComponentPropsWithRef, ReactNode } from 'react';
import * as S from './styles';

export type IconButtonVariant = 'surface' | 'ghost' | 'primary' | 'danger';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'aria-label' | 'children'> {
  /** Accessible name (also used as tooltip). Required: icon-only buttons have no visible text. */
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  children: ReactNode;
}

/** Circular icon button with a 44px touch target by default. */
export function IconButton({ label, variant = 'surface', size = 'md', type = 'button', children, ...rest }: IconButtonProps) {
  return (
    <S.Root type={type} aria-label={label} title={label} $variant={variant} $size={size} {...rest}>
      {children}
    </S.Root>
  );
}
