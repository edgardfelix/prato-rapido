import { Check, type LucideIcon } from 'lucide-react';
import * as S from './styles';

interface CheckTileProps {
  label: string;
  description?: string;
  icon: LucideIcon;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** Compact checkbox tile for grids (kitchen equipment, goals). Native checkbox underneath. */
export function CheckTile({ label, description, icon: Icon, checked, onChange }: CheckTileProps) {
  return (
    <S.Root $checked={checked}>
      <S.Input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <S.IconTile $checked={checked} aria-hidden="true">
        <Icon size={20} />
      </S.IconTile>
      <S.Texts>
        <S.Label>{label}</S.Label>
        {description && <S.Description>{description}</S.Description>}
      </S.Texts>
      <S.CheckMark $checked={checked} aria-hidden="true">
        <Check size={12} strokeWidth={3} />
      </S.CheckMark>
    </S.Root>
  );
}
