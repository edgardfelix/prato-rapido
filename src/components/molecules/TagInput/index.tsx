import { useId, useState, type KeyboardEvent } from 'react';
import { Plus } from 'lucide-react';
import { RemovableChip } from '@/components/atoms/Chip';
import { IconButton } from '@/components/atoms/IconButton';
import { normalizeText } from '@/utils/format';
import * as S from './styles';

interface TagInputProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  hint?: string;
  maxItems: number;
  maxChars: number;
}

/**
 * Free-text tags: Enter or comma adds, Backspace on an empty field removes
 * the last one. Duplicates are ignored regardless of case and accents.
 */
export function TagInput({
  label,
  values,
  onChange,
  suggestions = [],
  placeholder,
  hint,
  maxItems,
  maxChars,
}: TagInputProps) {
  const inputId = useId();
  const hintId = useId();
  const [draft, setDraft] = useState('');
  const known = new Set(values.map(normalizeText));
  const isFull = values.length >= maxItems;

  const add = (raw: string) => {
    const seen = new Set(values.map(normalizeText));
    const next = [...values];
    for (const part of raw.split(',')) {
      const cleaned = part.replace(/\s+/g, ' ').trim().slice(0, maxChars);
      const key = normalizeText(cleaned);
      if (!key || seen.has(key) || next.length >= maxItems) continue;
      seen.add(key);
      next.push(cleaned);
    }
    if (next.length !== values.length) onChange(next);
    setDraft('');
  };

  const remove = (value: string) => onChange(values.filter((item) => item !== value));

  // Virtual keyboards often report "Unidentified" keys, so commas are also handled on change.
  const handleChange = (value: string) => {
    if (value.includes(',')) add(value);
    else setDraft(value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      add(draft);
    } else if (event.key === 'Backspace' && !draft && values.length > 0) {
      remove(values[values.length - 1] ?? '');
    }
  };

  const availableSuggestions = suggestions.filter((suggestion) => !known.has(normalizeText(suggestion)));

  return (
    <S.Root>
      <S.Label htmlFor={inputId}>{label}</S.Label>
      <S.Field>
        <S.Input
          id={inputId}
          value={draft}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isFull ? 'Limite atingido' : placeholder}
          maxLength={maxChars}
          disabled={isFull}
          autoComplete="off"
          enterKeyHint="done"
          aria-describedby={hint ? hintId : undefined}
        />
        <IconButton size="sm" variant="primary" label={`Adicionar a ${label.toLowerCase()}`} onClick={() => add(draft)} disabled={!draft.trim() || isFull}>
          <Plus size={18} />
        </IconButton>
      </S.Field>

      {values.length > 0 && (
        <S.Chips>
          {values.map((value) => (
            <RemovableChip key={value} onRemove={() => remove(value)} removeLabel={`Remover ${value}`}>
              {value}
            </RemovableChip>
          ))}
        </S.Chips>
      )}

      {availableSuggestions.length > 0 && !isFull && (
        <S.Suggestions>
          {availableSuggestions.map((suggestion) => (
            <S.Suggestion key={suggestion} type="button" onClick={() => add(suggestion)}>
              <Plus size={13} strokeWidth={2.5} aria-hidden="true" />
              {suggestion}
            </S.Suggestion>
          ))}
        </S.Suggestions>
      )}

      {hint && (
        <S.Hint id={hintId}>
          {values.length}/{maxItems} · {hint}
        </S.Hint>
      )}
    </S.Root>
  );
}
