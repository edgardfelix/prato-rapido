import type { PropsWithChildren } from 'react';
import * as S from './styles';

/** Mobile-first frame: full width on phones, a centered 480px column on larger screens. */
export function AppShell({ children }: PropsWithChildren) {
  return (
    <S.Viewport>
      <S.Column>{children}</S.Column>
    </S.Viewport>
  );
}
