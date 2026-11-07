import { useCallback, useEffect, useMemo, type PropsWithChildren } from 'react';
import { flushSync } from 'react-dom';
import { ThemeProvider } from 'styled-components';
import { STORAGE_KEYS } from '@/constants/storage';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { GlobalStyle } from '@/styles/GlobalStyle';
import { palettes, theme, type ThemeMode } from '@/styles/theme';
import { sanitizeThemeMode } from '@/utils/validators';
import { ThemeModeContext, type ThemeModeContextValue } from './ThemeModeContext';

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Dark mode by default; the choice is persisted and applied before first paint (see index.html). */
export function ThemeModeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useLocalStorage<ThemeMode>(STORAGE_KEYS.theme, 'dark', sanitizeThemeMode);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', palettes[mode].background);
  }, [mode]);

  const toggleTheme = useCallback(() => {
    const next: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    if (typeof document.startViewTransition !== 'function' || prefersReducedMotion()) {
      setMode(next);
      return;
    }
    // Cross-fades the whole screen on the compositor instead of transitioning every element.
    document.startViewTransition(() => {
      flushSync(() => setMode(next));
    });
  }, [mode, setMode]);

  const value = useMemo<ThemeModeContextValue>(
    () => ({ mode, isDark: mode === 'dark', palette: palettes[mode], setMode, toggleTheme }),
    [mode, setMode, toggleTheme],
  );

  return (
    <ThemeModeContext value={value}>
      <ThemeProvider theme={theme}>
        <GlobalStyle $mode={mode} />
        {children}
      </ThemeProvider>
    </ThemeModeContext>
  );
}
