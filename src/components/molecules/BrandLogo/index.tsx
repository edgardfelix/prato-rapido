import fullDark from '@/assets/brand/logo-full-dark.webp';
import fullLight from '@/assets/brand/logo-full-light.webp';
import markDark from '@/assets/brand/logo-mark-dark.webp';
import markLight from '@/assets/brand/logo-mark-light.webp';
import { useThemeMode } from '@/hooks/useThemeMode';
import * as S from './styles';

interface BrandLogoProps {
  /** compact: mark + wordmark (header). full: the original stacked logo (welcome screen). */
  variant?: 'compact' | 'full';
}

export function BrandLogo({ variant = 'compact' }: BrandLogoProps) {
  const { isDark } = useThemeMode();

  if (variant === 'full') {
    return (
      <S.Full
        src={isDark ? fullDark : fullLight}
        alt="Prato Rápido"
        width={560}
        height={530}
        decoding="async"
        fetchPriority="high"
      />
    );
  }

  // Both marks stay mounted so switching themes never waits for a download.
  return (
    <S.Compact>
      <S.Mark src={markDark} alt="" width={233} height={144} decoding="async" hidden={!isDark} />
      <S.Mark src={markLight} alt="" width={233} height={144} decoding="async" hidden={isDark} />
      <S.Wordmark>
        Prato <span>Rápido</span>
      </S.Wordmark>
    </S.Compact>
  );
}
