import { createContext } from 'react';
import type { HumanVerification } from '@/@types';

export interface HumanCheckContextValue {
  /** A signed verification token is stored and has not expired (30 days). */
  isVerified: boolean;
  /** The first-load check was skipped because the server could not be reached; it comes back when needed. */
  isDeferred: boolean;
  completeVerification: (verification: HumanVerification) => void;
  deferVerification: () => void;
}

export const HumanCheckContext = createContext<HumanCheckContextValue | null>(null);
