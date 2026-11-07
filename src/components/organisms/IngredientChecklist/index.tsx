import { useId } from 'react';
import { Check } from 'lucide-react';
import { useSound } from '@/hooks/useSound';
import * as S from './styles';

interface IngredientChecklistProps {
  items: string[];
  /** Indexes already separated ("já tenho"); lifted so the WhatsApp list can use them. */
  checked: ReadonlySet<number>;
  onToggle: (index: number) => void;
}

/** Tap-to-check ingredient list ("mise en place"). */
export function IngredientChecklist({ items, checked, onToggle }: IngredientChecklistProps) {
  const headingId = useId();
  const { play } = useSound();

  const toggle = (index: number) => {
    play(checked.has(index) ? 'uncheck' : 'check');
    onToggle(index);
  };

  return (
    <S.Card aria-labelledby={headingId}>
      <S.Header>
        <S.Title id={headingId}>Ingredientes</S.Title>
        <S.Count aria-label={`${checked.size} de ${items.length} separados`}>
          {checked.size}/{items.length}
        </S.Count>
      </S.Header>
      <S.List>
        {items.map((item, index) => {
          const isChecked = checked.has(index);
          return (
            <li key={`${index}-${item}`}>
              <S.Row>
                <S.HiddenCheckbox type="checkbox" checked={isChecked} onChange={() => toggle(index)} />
                <S.Box $checked={isChecked} aria-hidden="true">
                  <Check size={14} strokeWidth={3} />
                </S.Box>
                <S.Text $checked={isChecked}>{item}</S.Text>
              </S.Row>
            </li>
          );
        })}
      </S.List>
    </S.Card>
  );
}
