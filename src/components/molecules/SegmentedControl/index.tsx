import type { CSSProperties } from 'react';
import * as S from './styles';

export interface SegmentedOption<TValue extends string> {
  value: TValue;
  label: string;
}

interface SegmentedControlProps<TValue extends string> {
  name: string;
  label: string;
  options: SegmentedOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
}

/** Single-choice control built on native radios (arrow keys work out of the box) with a sliding indicator. */
export function SegmentedControl<TValue extends string>({ name, label, options, value, onChange }: SegmentedControlProps<TValue>) {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  return (
    <S.Root
      role="radiogroup"
      aria-label={label}
      style={{ '--count': options.length, '--index': activeIndex } as CSSProperties}
    >
      <S.Indicator aria-hidden="true" />
      {options.map((option) => (
        <S.Option key={option.value} $active={option.value === value}>
          <S.Input
            type="radio"
            name={name}
            value={option.value}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
          />
          {option.label}
        </S.Option>
      ))}
    </S.Root>
  );
}
