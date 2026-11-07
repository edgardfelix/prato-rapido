import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { AppLayout } from './AppLayout';
import { PageFallback } from './PageFallback';
import { RequireOnboarding } from './RequireOnboarding';
import { ScrollToTop } from './ScrollToTop';

const loadOnboarding = () => import('@/pages/Onboarding');
const loadHome = () => import('@/pages/Home');
const loadRecipeResult = () => import('@/pages/RecipeResult');
const loadJourney = () => import('@/pages/Journey');
const loadTips = () => import('@/pages/Tips');
const loadProfile = () => import('@/pages/Profile');

// Each page is its own chunk, so the first paint only ships what it needs.
const Onboarding = lazy(loadOnboarding);
const Home = lazy(loadHome);
const RecipeResult = lazy(loadRecipeResult);
const Journey = lazy(loadJourney);
const Tips = lazy(loadTips);
const Profile = lazy(loadProfile);

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

/** Warms up the other route chunks once the browser is idle, so tab switches feel instant. */
function usePrefetchRoutes() {
  useEffect(() => {
    const idleWindow = window as IdleWindow;
    const prefetch = () => {
      for (const load of [loadHome, loadJourney, loadTips, loadProfile, loadRecipeResult, loadOnboarding]) void load();
    };
    if (idleWindow.requestIdleCallback) {
      const handle = idleWindow.requestIdleCallback(prefetch, { timeout: 3000 });
      return () => idleWindow.cancelIdleCallback?.(handle);
    }
    const timer = window.setTimeout(prefetch, 1500);
    return () => window.clearTimeout(timer);
  }, []);
}

export function AppRoutes() {
  usePrefetchRoutes();

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route element={<RequireOnboarding />}>
            <Route element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="home" element={<Navigate to="/" replace />} />
              <Route path="receita/:id" element={<RecipeResult />} />
              <Route path="journey" element={<Journey />} />
              <Route path="tips" element={<Tips />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
