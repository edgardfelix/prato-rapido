import { memo } from 'react';
import { Check } from 'lucide-react';
import type { QuickAction } from '@/constants/recipe';
import * as S from './styles';

interface QuickActionCardProps {
  action: QuickAction;
  selected: boolean;
  onSelect: (mode: QuickAction['mode']) => void;
}

/** Toggleable shortcut that sets the generation mode. */
export const QuickActionCard = memo(function QuickActionCard({ action, selected, onSelect }: QuickActionCardProps) {
  const Icon = action.icon;

  return (
    <S.Root type="button" aria-pressed={selected} $selected={selected} onClick={() => onSelect(action.mode)}>
      <S.IconTile $selected={selected} aria-hidden="true">
        <Icon size={20} />
      </S.IconTile>
      <S.Title>{action.title}</S.Title>
      <S.Description>{action.description}</S.Description>
      <S.CheckBadge $visible={selected} aria-hidden="true">
        <Check size={12} strokeWidth={3} />
      </S.CheckBadge>
    </S.Root>
  );
});
