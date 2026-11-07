import type { DefaultTheme } from 'styled-components';
import type { CelebrationTone } from '@/constants/journey';

/** Semantic accent per gamification tone (primary = cooking, streak = heat, water, gold = achievements). */
export function toneColors(theme: DefaultTheme, tone: CelebrationTone): { color: string; soft: string } {
  switch (tone) {
    case 'streak':
      return { color: theme.colors.streak, soft: theme.colors.streakSoft };
    case 'water':
      return { color: theme.colors.water, soft: theme.colors.waterSoft };
    case 'gold':
      return { color: theme.colors.gold, soft: theme.colors.goldSoft };
    case 'primary':
    default:
      return { color: theme.colors.primary, soft: theme.colors.primarySoft };
  }
}
