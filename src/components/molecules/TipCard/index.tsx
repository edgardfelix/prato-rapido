import { memo, useId } from 'react';
import { ChevronDown, Target, type LucideIcon } from 'lucide-react';
import type { Tip } from '@/@types';
import * as S from './styles';

interface TipCardProps {
  tip: Tip;
  categoryLabel: string;
  icon: LucideIcon;
  isRecommended: boolean;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

/** Accordion card. Height animates with the grid-rows technique (no JS measuring). */
export const TipCard = memo(function TipCard({
  tip,
  categoryLabel,
  icon: Icon,
  isRecommended,
  isExpanded,
  onToggle,
}: TipCardProps) {
  const buttonId = useId();
  const panelId = useId();

  return (
    <S.Card $expanded={isExpanded}>
      <S.Header
        type="button"
        id={buttonId}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        onClick={() => onToggle(tip.id)}
      >
        <S.IconTile aria-hidden="true">
          <Icon size={20} />
        </S.IconTile>
        <S.Texts>
          <S.Meta>
            {categoryLabel}
            {isRecommended && (
              <S.ForYou>
                <Target size={11} strokeWidth={2.5} aria-hidden="true" /> Para seu objetivo
              </S.ForYou>
            )}
          </S.Meta>
          <S.Title>{tip.title}</S.Title>
          <S.Summary>{tip.summary}</S.Summary>
        </S.Texts>
        <S.Chevron $expanded={isExpanded} aria-hidden="true">
          <ChevronDown size={20} />
        </S.Chevron>
      </S.Header>

      <S.Panel id={panelId} role="region" aria-labelledby={buttonId} $expanded={isExpanded}>
        <S.PanelInner>
          <S.Details>
            {tip.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </S.Details>
        </S.PanelInner>
      </S.Panel>
    </S.Card>
  );
});
