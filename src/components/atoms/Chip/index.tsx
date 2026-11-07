import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Check, X, type LucideIcon } from 'lucide-react';
import * as S from './styles';

interface ChipProps extends Omit<ComponentPropsWithRef<'button'>, 'onClick' | 'children'> {
  selected: boolean;
  onToggle: () => void;
  icon?: LucideIcon;
  children: ReactNode;
}

/** Toggle pill (aria-pressed). */
export function Chip({ selected, onToggle, icon: Icon, children, type = 'button', ...rest }: ChipProps) {
  return (
    <S.Root type={type} aria-pressed={selected} $selected={selected} onClick={onToggle} {...rest}>
      {selected ? <Check size={15} strokeWidth={3} aria-hidden="true" /> : Icon && <Icon size={15} aria-hidden="true" />}
      <span>{children}</span>
    </S.Root>
  );
}

interface RemovableChipProps {
  children: ReactNode;
  onRemove: () => void;
  removeLabel: string;
}

/** Static pill with its own remove button (e.g. a disliked ingredient). */
export function RemovableChip({ children, onRemove, removeLabel }: RemovableChipProps) {
  return (
    <S.Removable>
      <span>{children}</span>
      <S.RemoveButton type="button" aria-label={removeLabel} onClick={onRemove}>
        <X size={14} strokeWidth={2.5} />
      </S.RemoveButton>
    </S.Removable>
  );
}
