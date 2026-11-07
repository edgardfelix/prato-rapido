import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router';

/** Declarative routing has no scroll restoration: start every screen at the top. */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
