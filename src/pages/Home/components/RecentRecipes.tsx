import { memo, useState } from 'react';
import { ChevronRight, UtensilsCrossed } from 'lucide-react';
import type { SavedRecipe } from '@/@types';
import { Section, SectionHeader, SectionTitle } from '@/components/templates/PageLayout';
import { LIMITS } from '@/constants/limits';
import { resolveApiUrl } from '@/services/httpClient';
import { formatRelativeDay } from '@/utils/format';
import * as S from './RecentRecipes.styles';

interface RecentRecipesProps {
  recipes: SavedRecipe[];
}

export const RecentRecipes = memo(function RecentRecipes({ recipes }: RecentRecipesProps) {
  const [showAll, setShowAll] = useState(false);
  if (recipes.length === 0) return null;

  const visible = showAll ? recipes : recipes.slice(0, LIMITS.recentOnHome);
  const canExpand = recipes.length > LIMITS.recentOnHome;

  return (
    <Section aria-labelledby="recent-recipes-title">
      <SectionHeader>
        <SectionTitle id="recent-recipes-title">Receitas recentes</SectionTitle>
        <S.Count>{recipes.length === 1 ? '1 salva' : `${recipes.length} salvas`}</S.Count>
      </SectionHeader>

      <S.List>
        {visible.map((item) => (
          <li key={item.id}>
            <S.Item to={`/receita/${item.id}`}>
              <S.Thumb>
                <UtensilsCrossed size={18} aria-hidden="true" />
                <img
                  src={resolveApiUrl(item.imageUrl)}
                  alt=""
                  width={56}
                  height={56}
                  loading="lazy"
                  decoding="async"
                  onError={(event) => {
                    event.currentTarget.style.visibility = 'hidden';
                  }}
                />
              </S.Thumb>
              <S.Info>
                <strong>{item.recipe.nome_receita}</strong>
                <span>
                  {item.recipe.tempo_preparo} · {item.recipe.dificuldade} · {formatRelativeDay(item.createdAt)}
                </span>
              </S.Info>
              <ChevronRight size={18} aria-hidden="true" />
            </S.Item>
          </li>
        ))}
      </S.List>

      {canExpand && (
        <S.ToggleButton type="button" onClick={() => setShowAll((current) => !current)}>
          {showAll ? 'Mostrar menos' : `Ver todas (${recipes.length})`}
        </S.ToggleButton>
      )}
    </Section>
  );
});
