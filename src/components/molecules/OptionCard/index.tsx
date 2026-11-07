import { Check, type LucideIcon } from 'lucide-react';
import * as S from './styles';

interface OptionCardProps<TValue extends string> {
  type: 'radio' | 'checkbox';
  name: string;
  value: TValue;
  checked: boolean;
  onSelect: (value: TValue) => void;
  icon: LucideIcon;
  label: string;
  description?: string;
}

/**
 * Large selectable card for the onboarding quiz. A real (visually hidden)
 * radio/checkbox input keeps native keyboard and screen reader behaviour.
 */
export function OptionCard<TValue extends string>({
  type,
  name,
  value,
  checked,
  onSelect,
  icon: Icon,
  label,
  description,
}: OptionCardProps<TValue>) {
  return (
    <S.Root $checked={checked}>
      <S.HiddenInput type={type} name={name} value={value} checked={checked} onChange={() => onSelect(value)} />
      <S.IconTile $checked={checked} aria-hidden="true">
        <Icon size={22} />
      </S.IconTile>
      <S.Texts>
        <S.Title>{label}</S.Title>
        {description && <S.Description>{description}</S.Description>}
      </S.Texts>
      <S.Indicator $type={type} $checked={checked} aria-hidden="true">
        <Check size={14} strokeWidth={3} />
      </S.Indicator>
    </S.Root>
  );
}
