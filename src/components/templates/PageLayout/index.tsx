import { useEffect, useRef, type ComponentPropsWithoutRef } from 'react';
import styled from 'styled-components';
import { prefersReducedMotion } from '@/utils/motion';

/* Layout primitives shared by every page of the mobile column. */

export const Page = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const Content = styled.main`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 28px;
  padding: 20px ${({ theme }) => theme.layout.gutter} 40px;
`;

const STAGGER_MS = 45;
const MAX_STAGGERED = 8;
const ENTRANCE: Keyframe[] = [
  { opacity: 0, transform: 'translateY(10px)' },
  { opacity: 1, transform: 'none' },
];

/**
 * Page body. Its top-level blocks fade and rise in one after the other when
 * the page mounts. Web Animations (not CSS) on purpose: they run once and
 * never override the blocks' own CSS animations (e.g. the recording pulse).
 */
export function PageContent(props: ComponentPropsWithoutRef<'main'>) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion() || typeof element.animate !== 'function') return;
    const animations = [...element.children].slice(0, MAX_STAGGERED).map((child, index) =>
      child.animate(ENTRANCE, {
        duration: 420,
        delay: 40 + index * STAGGER_MS,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'backwards',
      }),
    );
    return () => {
      for (const animation of animations) animation.cancel();
    };
  }, []);

  return <Content ref={ref} {...props} />;
}

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
`;

export const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

export const StickyFooter = styled.div`
  position: sticky;
  bottom: 0;
  z-index: ${({ theme }) => theme.zIndex.header};
  padding: 16px ${({ theme }) => theme.layout.gutter} calc(16px + env(safe-area-inset-bottom));
  background: linear-gradient(to top, ${({ theme }) => theme.colors.background} 72%, transparent);
`;
