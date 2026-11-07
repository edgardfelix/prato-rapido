import { Suspense } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router';
import styled, { css } from 'styled-components';
import { BottomNav, type NavDirection } from '@/components/layout/BottomNav';
import { screenInBack, screenInForward } from '@/styles/animations';
import { PageFallback } from './PageFallback';

type ScreenDirection = NavDirection | 'none';

const Root = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  /* Room for the floating tab bar so the end of every page can scroll above it. */
  padding-bottom: calc(${({ theme }) => theme.layout.bottomNavSpace} + 8px);
`;

/**
 * Slides each new screen in from the side it comes from. Fill mode
 * "backwards" means no transform is left on the element after the animation
 * (a lingering transform would break position: fixed descendants).
 */
const Screen = styled.div<{ $direction: ScreenDirection }>`
  display: flex;
  flex: 1;
  flex-direction: column;

  ${({ $direction, theme }) =>
    $direction !== 'none' &&
    css`
      animation: ${$direction === 'back' ? screenInBack : screenInForward} 300ms ${theme.motion.easeOut} backwards;
    `}
`;

const readDirection = (state: unknown): NavDirection =>
  typeof state === 'object' && state !== null && (state as { navDirection?: unknown }).navDirection === 'back'
    ? 'back'
    : 'forward';

/** Shell of the signed-in area: the page plus the persistent tab bar (it stays while a page chunk loads). */
export function AppLayout() {
  const location = useLocation();
  const navigationType = useNavigationType();
  // First load: no slide (the page content still staggers in). Browser back/forward: from the left.
  const direction: ScreenDirection =
    location.key === 'default' ? 'none' : navigationType === 'POP' ? 'back' : readDirection(location.state);

  return (
    <Root>
      <Screen key={location.pathname} $direction={direction}>
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </Screen>
      <BottomNav />
    </Root>
  );
}
