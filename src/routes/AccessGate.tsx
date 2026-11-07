import type { PropsWithChildren } from 'react';
import { PaywallScreen } from '@/components/PaywallScreen';
import { useAccess } from '@/hooks/useAccess';
import { PageFallback } from './PageFallback';

/**
 * Intercepts the router while the device has no buyer access. Real protection
 * is on the server (AI routes check the signed access token): this gate only
 * decides what to show.
 */
export function AccessGate({ children }: PropsWithChildren) {
  const { state } = useAccess();
  if (state === 'unlocked' || state === 'open') return children;
  if (state === 'checking') return <PageFallback />;
  return <PaywallScreen />;
}
