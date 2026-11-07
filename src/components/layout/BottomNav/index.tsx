import type { CSSProperties } from 'react';
import { ChefHat, Flame, Lightbulb, User, type LucideIcon } from 'lucide-react';
import { useLocation } from 'react-router';
import { useIsTyping } from '@/hooks/useIsTyping';
import { useJourney } from '@/hooks/useJourney';
import * as S from './styles';

/** Which way the next screen slides in (read by AppLayout from the navigation state). */
export type NavDirection = 'forward' | 'back';

interface NavItem {
  to: string;
  label: string;
  /** Full name read by screen readers. */
  description: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    to: '/',
    label: 'Início',
    description: 'Início: gerar receitas',
    icon: ChefHat,
    isActive: (pathname) => pathname === '/' || pathname.startsWith('/receita'),
  },
  {
    to: '/journey',
    label: 'Jornada',
    description: 'Jornada 30 Dias',
    icon: Flame,
    isActive: (pathname) => pathname.startsWith('/journey'),
  },
  {
    to: '/tips',
    label: 'Dicas',
    description: 'Dicas e Dieta',
    icon: Lightbulb,
    isActive: (pathname) => pathname.startsWith('/tips'),
  },
  {
    to: '/profile',
    label: 'Perfil',
    description: 'Perfil e IA',
    icon: User,
    isActive: (pathname) => pathname.startsWith('/profile'),
  },
];

/**
 * Floating glass tab bar (backdrop blur over the scrolling content). A lens
 * glides behind the active tab, and the bar tucks away while the on-screen
 * keyboard is open.
 */
export function BottomNav() {
  const { pathname } = useLocation();
  const { isTodayCompleted, isFinished } = useJourney();
  const isTyping = useIsTyping();

  const activeIndex = NAV_ITEMS.findIndex((item) => item.isActive(pathname));
  const showJourneyReminder = !isTodayCompleted && !isFinished;

  return (
    <S.Bar aria-label="Navegação principal" $hidden={isTyping}>
      <S.Glass style={{ '--active': Math.max(activeIndex, 0) } as CSSProperties}>
        {activeIndex >= 0 && <S.Lens aria-hidden="true" />}
        <S.List>
          {NAV_ITEMS.map((item, index) => {
            const isActive = index === activeIndex;
            const Icon = item.icon;
            const hasReminder = item.to === '/journey' && showJourneyReminder;

            return (
              <li key={item.to}>
                <S.Item
                  to={item.to}
                  state={{ navDirection: (index < activeIndex ? 'back' : 'forward') satisfies NavDirection }}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={hasReminder ? `${item.description} (o dia de hoje ainda não foi marcado)` : item.description}
                  $active={isActive}
                >
                  <S.IconWrap $active={isActive}>
                    <Icon size={22} strokeWidth={isActive ? 2.4 : 2} aria-hidden="true" />
                    {hasReminder && <S.Dot aria-hidden="true" />}
                  </S.IconWrap>
                  <S.Label aria-hidden="true">{item.label}</S.Label>
                </S.Item>
              </li>
            );
          })}
        </S.List>
      </S.Glass>
    </S.Bar>
  );
}
