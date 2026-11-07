import type { LucideIcon } from 'lucide-react';
import * as S from './styles';

export interface FilterOption<TValue extends string> {
  value: TValue;
  label: string;
  icon?: LucideIcon;
}

interface FilterPillsProps<TValue extends string> {
  name: string;
  label: string;
  options: FilterOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
}

/** Single-choice filter pills (native radios). Pills wrap so every option stays visible. */
export function FilterPills<TValue extends string>({ name, label, options, value, onChange }: FilterPillsProps<TValue>) {
  return (
    <S.Root role="radiogroup" aria-label={label}>
      {options.map(({ value: optionValue, label: optionLabel, icon: Icon }) => (
        <S.Pill key={optionValue} $active={optionValue === value}>
          <S.Input
            type="radio"
            name={name}
            value={optionValue}
            checked={optionValue === value}
            onChange={() => onChange(optionValue)}
          />
          {Icon && <Icon size={15} aria-hidden="true" />}
          {optionLabel}
        </S.Pill>
      ))}
    </S.Root>
  );
}
