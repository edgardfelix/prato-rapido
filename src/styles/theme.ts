/**
 * Design tokens for Prato Rápido (Tech-Minimalist / Modern Gourmet).
 *
 * Colors are exposed to styled-components as CSS custom properties
 * (`var(--pr-*)`). The ThemeProvider value never changes between modes, so
 * toggling dark/light only swaps the variable values in <GlobalStyle /> and
 * no component has to re-render or regenerate its CSS.
 */

export type ThemeMode = 'dark' | 'light';

export interface Palette {
  background: string;
  backdrop: string;
  surface: string;
  surfaceRaised: string;
  surfaceHover: string;
  border: string;
  borderStrong: string;
  primary: string;
  primaryHover: string;
  primaryPressed: string;
  primarySoft: string;
  primaryBorder: string;
  onPrimary: string;
  brand: string;
  /** Streaks and "heat" (the logo orange). */
  streak: string;
  streakSoft: string;
  /** Hydration tracker. */
  water: string;
  waterSoft: string;
  /** Achievements and badges. */
  gold: string;
  goldSoft: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  danger: string;
  dangerSoft: string;
  onDanger: string;
  warning: string;
  warningSoft: string;
  overlay: string;
  headerBackground: string;
  /** Frosted surface of the floating tab bar (paired with backdrop-filter). */
  glass: string;
  glassBorder: string;
  glassShadow: string;
  skeleton: string;
  skeletonShine: string;
  focusRing: string;
  shadowCard: string;
  shadowRaised: string;
  shadowPrimary: string;
}

export const darkPalette: Palette = {
  background: '#0F1115',
  backdrop: '#08090C',
  surface: '#1A1D24',
  surfaceRaised: '#22262F',
  surfaceHover: '#2A2F3A',
  border: 'rgba(243, 244, 246, 0.08)',
  borderStrong: 'rgba(243, 244, 246, 0.16)',
  primary: '#10B981',
  primaryHover: '#34D399',
  primaryPressed: '#059669',
  primarySoft: 'rgba(16, 185, 129, 0.14)',
  primaryBorder: 'rgba(16, 185, 129, 0.55)',
  onPrimary: '#03140D',
  brand: '#FD6100',
  streak: '#FF7A1A',
  streakSoft: 'rgba(253, 97, 0, 0.16)',
  water: '#38BDF8',
  waterSoft: 'rgba(56, 189, 248, 0.14)',
  gold: '#FBBF24',
  goldSoft: 'rgba(251, 191, 36, 0.14)',
  textPrimary: '#F3F4F6',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  danger: '#F87171',
  dangerSoft: 'rgba(248, 113, 113, 0.14)',
  onDanger: '#FFFFFF',
  warning: '#FBBF24',
  warningSoft: 'rgba(251, 191, 36, 0.12)',
  overlay: 'rgba(4, 5, 7, 0.72)',
  headerBackground: 'rgba(15, 17, 21, 0.84)',
  glass: 'rgba(30, 34, 42, 0.62)',
  glassBorder: 'rgba(255, 255, 255, 0.09)',
  glassShadow: '0 12px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.07)',
  skeleton: '#1F232B',
  skeletonShine: 'rgba(255, 255, 255, 0.07)',
  focusRing: 'rgba(52, 211, 153, 0.75)',
  shadowCard: '0 1px 0 rgba(255, 255, 255, 0.03) inset',
  shadowRaised: '0 -18px 48px rgba(0, 0, 0, 0.55)',
  shadowPrimary: '0 10px 24px -10px rgba(16, 185, 129, 0.6)',
};

export const lightPalette: Palette = {
  background: '#F8FAFC',
  backdrop: '#E7ECF2',
  surface: '#FFFFFF',
  surfaceRaised: '#F1F5F9',
  surfaceHover: '#E7EDF4',
  border: 'rgba(15, 23, 42, 0.08)',
  borderStrong: 'rgba(15, 23, 42, 0.16)',
  primary: '#059669',
  primaryHover: '#047857',
  primaryPressed: '#065F46',
  primarySoft: 'rgba(5, 150, 105, 0.1)',
  primaryBorder: 'rgba(5, 150, 105, 0.5)',
  onPrimary: '#FFFFFF',
  brand: '#F25C00',
  streak: '#E85500',
  streakSoft: 'rgba(242, 92, 0, 0.1)',
  water: '#0284C7',
  waterSoft: 'rgba(2, 132, 199, 0.1)',
  gold: '#B45309',
  goldSoft: 'rgba(245, 158, 11, 0.14)',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  danger: '#DC2626',
  dangerSoft: 'rgba(220, 38, 38, 0.08)',
  onDanger: '#FFFFFF',
  warning: '#B45309',
  warningSoft: 'rgba(245, 158, 11, 0.14)',
  overlay: 'rgba(15, 23, 42, 0.42)',
  headerBackground: 'rgba(248, 250, 252, 0.86)',
  glass: 'rgba(255, 255, 255, 0.64)',
  glassBorder: 'rgba(255, 255, 255, 0.85)',
  glassShadow: '0 10px 30px rgba(15, 23, 42, 0.14), 0 1px 2px rgba(15, 23, 42, 0.08)',
  skeleton: '#E6EBF1',
  skeletonShine: 'rgba(255, 255, 255, 0.8)',
  focusRing: 'rgba(5, 150, 105, 0.55)',
  shadowCard: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.05)',
  shadowRaised: '0 -18px 48px rgba(15, 23, 42, 0.16)',
  shadowPrimary: '0 10px 24px -12px rgba(5, 150, 105, 0.55)',
};

export const palettes: Record<ThemeMode, Palette> = {
  dark: darkPalette,
  light: lightPalette,
};

type PaletteKey = keyof Palette;

const paletteKeys = Object.keys(darkPalette) as PaletteKey[];

const toCssVarName = (key: PaletteKey): string =>
  `--pr-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;

/** Serializes a palette into CSS custom property declarations. */
export function paletteToCssVariables(palette: Palette): string {
  return paletteKeys.map((key) => `${toCssVarName(key)}: ${palette[key]};`).join('\n');
}

const colors = Object.fromEntries(
  paletteKeys.map((key) => [key, `var(${toCssVarName(key)})`]),
) as Record<PaletteKey, string>;

const BOTTOM_NAV_HEIGHT = '64px';
const BOTTOM_NAV_OFFSET = '10px';

export const theme = {
  colors,
  shadows: {
    card: colors.shadowCard,
    raised: colors.shadowRaised,
    primary: colors.shadowPrimary,
  },
  fonts: {
    display:
      "'Plus Jakarta Sans Variable', 'Plus Jakarta Sans', 'Inter Variable', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    body: "'Inter Variable', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.375rem',
    xxl: '1.75rem',
    display: '2rem',
  },
  fontWeights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeights: {
    tight: 1.15,
    snug: 1.3,
    normal: 1.55,
  },
  radii: {
    sm: '10px',
    md: '14px',
    lg: '20px',
    xl: '28px',
    full: '999px',
  },
  space: {
    xxs: '4px',
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  layout: {
    maxWidth: '480px',
    gutter: '20px',
    headerHeight: '64px',
    bottomNavHeight: BOTTOM_NAV_HEIGHT,
    /** Gap between the floating tab bar and the bottom edge (above the safe area). */
    bottomNavOffset: BOTTOM_NAV_OFFSET,
    /** Total height the floating tab bar takes from the bottom of the viewport. */
    bottomNavSpace: `calc(${BOTTOM_NAV_HEIGHT} + ${BOTTOM_NAV_OFFSET} + env(safe-area-inset-bottom))`,
    touchTarget: '44px',
  },
  motion: {
    fast: '140ms',
    base: '220ms',
    slow: '360ms',
    easeOut: 'cubic-bezier(0.22, 1, 0.36, 1)',
    easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  },
  zIndex: {
    header: 10,
    bottomNav: 20,
    cookingMode: 90,
    overlay: 100,
    modal: 110,
    celebration: 120,
    toast: 130,
  },
} as const;

export type AppTheme = typeof theme;
