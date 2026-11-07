import type { ReactNode } from 'react';
import { BrandLogo } from '@/components/molecules/BrandLogo';
import { ThemeToggle } from '@/components/molecules/ThemeToggle';
import * as S from './styles';

interface HeaderProps {
  /** Left slot (e.g. a back button). When empty, the brand logo is shown. */
  leading?: ReactNode;
  title?: string;
  /** Extra actions rendered before the theme toggle. */
  trailing?: ReactNode;
  showBrand?: boolean;
}

/** Sticky, translucent app bar. The theme toggle is always available. */
export function Header({ leading, title, trailing, showBrand = true }: HeaderProps) {
  return (
    <S.Bar>
      <S.Inner>
        <S.Start>
          {leading}
          {!leading && showBrand && (
            <S.Brand>
              <BrandLogo />
            </S.Brand>
          )}
          {title && <S.Title>{title}</S.Title>}
        </S.Start>
        <S.End>
          {trailing}
          <ThemeToggle />
        </S.End>
      </S.Inner>
    </S.Bar>
  );
}
