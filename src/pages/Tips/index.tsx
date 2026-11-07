import { useCallback, useMemo, useState } from 'react';
import { Layers, Sparkles } from 'lucide-react';
import type { TipCategory } from '@/@types';
import { FilterPills, type FilterOption } from '@/components/molecules/FilterPills';
import { TipCard } from '@/components/molecules/TipCard';
import { Header } from '@/components/organisms/Header';
import { Page, PageContent } from '@/components/templates/PageLayout';
import { TIP_CATEGORIES, TIPS } from '@/constants/tips';
import { useJourney } from '@/hooks/useJourney';
import { useUser } from '@/hooks/useUser';
import * as S from './styles';

type TipFilter = 'all' | TipCategory;

const FILTER_OPTIONS: FilterOption<TipFilter>[] = [
  { value: 'all', label: 'Todas', icon: Layers },
  ...TIP_CATEGORIES.map(({ value, label, icon }) => ({ value, label, icon })),
];

const CATEGORY_BY_VALUE = Object.fromEntries(TIP_CATEGORIES.map((category) => [category.value, category])) as Record<
  TipCategory,
  (typeof TIP_CATEGORIES)[number]
>;

/** Same tip for everyone on a given day: a reason to come back tomorrow. */
function pickTipOfTheDay(dateKey: string) {
  let hash = 0;
  for (const character of dateKey) hash = (hash * 31 + (character.codePointAt(0) ?? 0)) >>> 0;
  return TIPS[hash % TIPS.length] ?? TIPS[0];
}

export default function Tips() {
  const { user } = useUser();
  const { today } = useJourney();
  const [filter, setFilter] = useState<TipFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const goals = useMemo(() => new Set(user?.aiContext.goals ?? []), [user]);
  const tipOfTheDay = pickTipOfTheDay(today);
  const visibleTips = filter === 'all' ? TIPS : TIPS.filter((tip) => tip.category === filter);

  const toggleTip = useCallback((id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  }, []);

  return (
    <Page>
      <Header />
      <PageContent>
        <S.Intro>
          <S.Title>Dicas &amp; Dieta</S.Title>
          <S.Subtitle>Truques rápidos para comer melhor, conservar mais e desperdiçar menos.</S.Subtitle>
        </S.Intro>

        {tipOfTheDay && (
          <S.DailyCard aria-labelledby="tip-of-the-day">
            <S.DailyLabel>
              <Sparkles size={14} aria-hidden="true" /> Dica do dia
            </S.DailyLabel>
            <S.DailyTitle id="tip-of-the-day">{tipOfTheDay.title}</S.DailyTitle>
            <S.DailyText>{tipOfTheDay.details[0]}</S.DailyText>
          </S.DailyCard>
        )}

        <FilterPills name="tip-category" label="Filtrar dicas por categoria" options={FILTER_OPTIONS} value={filter} onChange={setFilter} />

        <S.ResultCount role="status">
          {visibleTips.length} {visibleTips.length === 1 ? 'dica' : 'dicas'}
        </S.ResultCount>

        <S.List>
          {visibleTips.map((tip) => {
            const category = CATEGORY_BY_VALUE[tip.category];
            return (
              <li key={tip.id}>
                <TipCard
                  tip={tip}
                  categoryLabel={category.label}
                  icon={category.icon}
                  isRecommended={tip.goals.some((goal) => goals.has(goal))}
                  isExpanded={expandedId === tip.id}
                  onToggle={toggleTip}
                />
              </li>
            );
          })}
        </S.List>

        <S.Footnote>Dicas gerais de cozinha. Para orientações de dieta individuais, procure um nutricionista.</S.Footnote>
      </PageContent>
    </Page>
  );
}
