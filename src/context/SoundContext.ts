import { createContext } from 'react';
import type { HapticName, SoundName } from '@/services/sound';

export interface SoundContextValue {
  /** Global "Sons e vibração" setting (Perfil → Preferências do app). */
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  /** Short synthesized sound; a no-op when muted or unsupported. */
  play: (sound: SoundName) => void;
  /** Short vibration on devices that support it; a no-op when muted. */
  haptic: (pattern: HapticName) => void;
  /** Back to the defaults (used when the account data is erased). */
  resetSettings: () => void;
}

export const SoundContext = createContext<SoundContextValue | null>(null);
