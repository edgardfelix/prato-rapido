import { Moon, Sun } from 'lucide-react';
import { IconButton } from '@/components/atoms/IconButton';
import { useThemeMode } from '@/hooks/useThemeMode';
import * as S from './styles';

/** Shows the icon of the mode the user will switch to. */
export function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeMode();

  return (
    <IconButton variant="ghost" label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'} onClick={toggleTheme}>
      <S.IconStack $isDark={isDark} aria-hidden="true">
        <Sun size={20} className="sun" />
        <Moon size={20} className="moon" />
      </S.IconStack>
    </IconButton>
  );
}
