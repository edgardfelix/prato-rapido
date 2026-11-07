import * as S from './styles';

interface SkeletonProps {
  width?: string;
  height?: string;
  radius?: string;
  className?: string;
}

/** Shimmering placeholder. Sizes go through inline style so no extra CSS classes are generated. */
export function Skeleton({ width = '100%', height = '16px', radius, className }: SkeletonProps) {
  return <S.Block aria-hidden="true" className={className} style={{ width, height, borderRadius: radius }} />;
}
