import { createContext } from 'react';
import type { AccessGrant } from '@/@types';

/**
 * - `checking`: first visit, waiting to learn whether the server has a paywall.
 * - `locked`: the activation screen must be shown.
 * - `unlocked`: this device holds a valid buyer access.
 * - `open`: the server has no paywall (Upstash not configured): the app is free.
 */
export type AccessState = 'checking' | 'locked' | 'unlocked' | 'open';

export interface AccessContextValue {
  state: AccessState;
  grant: AccessGrant | null;
  checkoutUrl: string | null;
  priceLabel: string;
  /** Why the device was locked again (refund, expiry), shown on the activation screen. */
  lockMessage: string | null;
  /** The paywall status could not be loaded (offline or server down). */
  statusError: boolean;
  /** Saves the access (plus the `prato_rapido_access` flag) and unlocks the app. */
  grantAccess: (grant: AccessGrant) => void;
  /** Removes this device's access ("Sair deste aparelho"). */
  signOut: () => void;
  retryStatus: () => void;
}

export const AccessContext = createContext<AccessContextValue | null>(null);
