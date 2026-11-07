import type { RefObject } from 'react';
import { OptionCard } from '@/components/molecules/OptionCard';
import type { QuizOption } from '@/constants/quiz';
import * as S from '../styles';

interface ChoiceStepProps<TValue extends string> {
  headingRef: RefObject<HTMLHeadingElement | null>;
  heading: string;
  description: string;
  type: 'radio' | 'checkbox';
  name: string;
  options: QuizOption<TValue>[];
  isSelected: (value: TValue) => boolean;
  onSelect: (value: TValue) => void;
}

/** One quiz question rendered as a list of large selectable cards. */
export function ChoiceStep<TValue extends string>({
  headingRef,
  heading,
  description,
  type,
  name,
  options,
  isSelected,
  onSelect,
}: ChoiceStepProps<TValue>) {
  return (
    <S.StepBody>
      <S.Heading ref={headingRef} tabIndex={-1}>
        {heading}
      </S.Heading>
      <S.Intro>{description}</S.Intro>
      <S.Fieldset>
        <S.Legend>{heading}</S.Legend>
        {options.map((option) => (
          <OptionCard
            key={option.value}
            type={type}
            name={name}
            value={option.value}
            checked={isSelected(option.value)}
            onSelect={onSelect}
            icon={option.icon}
            label={option.label}
            description={option.description}
          />
        ))}
      </S.Fieldset>
    </S.StepBody>
  );
}
