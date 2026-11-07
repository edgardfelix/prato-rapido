import type { CSSProperties } from 'react';
import type { AvatarChoice } from '@/@types';
import { findAvatarIcon } from '@/constants/avatars';
import { getInitials } from '@/utils/format';
import * as S from './styles';

interface AvatarProps {
  avatar: AvatarChoice;
  name: string;
  size?: number;
}

/** User avatar: uploaded photo, food icon or initials. Decorative (the name is shown next to it). */
export function Avatar({ avatar, name, size = 40 }: AvatarProps) {
  const dimensions: CSSProperties = { width: size, height: size };

  if (avatar.kind === 'photo') {
    return <S.Photo src={avatar.dataUrl} alt="" width={size} height={size} style={dimensions} aria-hidden="true" />;
  }

  if (avatar.kind === 'icon') {
    const option = findAvatarIcon(avatar.icon);
    if (option) {
      const Icon = option.icon;
      return (
        <S.IconCircle style={{ ...dimensions, '--avatar-color': option.color } as CSSProperties} aria-hidden="true">
          <Icon size={Math.round(size * 0.52)} />
        </S.IconCircle>
      );
    }
  }

  return (
    <S.Initials style={{ ...dimensions, fontSize: Math.round(size * 0.36) }} aria-hidden="true">
      {getInitials(name)}
    </S.Initials>
  );
}
