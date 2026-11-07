import { useContext } from 'react';
import { ThemeModeContext, type ThemeModeContextValue } from '@/context/ThemeModeContext';

export function useThemeMode(): ThemeModeContextValue {
  const context = useContext(ThemeModeContext);
  if (!context) throw new Error('useThemeMode must be used inside <ThemeModeProvider>.');
  return context;
}
