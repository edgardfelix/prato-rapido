import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import * as S from './styles';

export type TagTone = 'neutral' | 'primary' | 'warning';

interface TagProps {
  icon?: LucideIcon;
  tone?: TagTone;
  children: ReactNode;
}

/** Small static pill for metadata (time, difficulty, preferences). */
export function Tag({ icon: Icon, tone = 'neutral', children }: TagProps) {
  return (
    <S.Root $tone={tone}>
      {Icon && <Icon size={14} strokeWidth={2.25} aria-hidden="true" />}
      {children}
    </S.Root>
  );
}
