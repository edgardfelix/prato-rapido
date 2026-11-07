import { createContext } from 'react';
import type { Palette, ThemeMode } from '@/styles/theme';

export interface ThemeModeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  /** Raw color values of the active mode (for canvas, meta tags, etc.). */
  palette: Palette;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);
