import { Navigate, Outlet } from 'react-router';
import { useUser } from '@/hooks/useUser';

/** Sends first-time visitors to the onboarding flow. */
export function RequireOnboarding() {
  const { isOnboarded } = useUser();
  return isOnboarded ? <Outlet /> : <Navigate to="/onboarding" replace />;
}
