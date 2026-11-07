import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, type PropsWithChildren } from 'react';
import type { AppSettings } from '@/@types';
import { STORAGE_KEYS } from '@/constants/storage';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { playSound, unlockAudio, vibrate, type HapticName, type SoundName } from '@/services/sound';
import { DEFAULT_SETTINGS, sanitizeSettings } from '@/utils/validators';
import { SoundContext, type SoundContextValue } from './SoundContext';

/** Sound + haptic feedback, with the user's on/off choice persisted in localStorage. */
export function SoundProvider({ children }: PropsWithChildren) {
  const [settings, setSettings, removeSettings] = useLocalStorage<AppSettings>(
    STORAGE_KEYS.settings,
    DEFAULT_SETTINGS,
    sanitizeSettings,
  );
  const enabledRef = useRef(settings.soundEnabled);

  useLayoutEffect(() => {
    enabledRef.current = settings.soundEnabled;
  });

  // Browsers only start audio inside a user gesture: warm the context up on the first tap or key press.
  useEffect(() => {
    if (!settings.soundEnabled) return;
    const unlock = () => unlockAudio();
    window.addEventListener('pointerdown', unlock, { once: true, capture: true });
    window.addEventListener('keydown', unlock, { once: true, capture: true });
    return () => {
      window.removeEventListener('pointerdown', unlock, { capture: true });
      window.removeEventListener('keydown', unlock, { capture: true });
    };
  }, [settings.soundEnabled]);

  // Stable callbacks that read the latest setting, so toggling never re-renders consumers.
  const play = useCallback((sound: SoundName) => {
    if (enabledRef.current) playSound(sound);
  }, []);

  const haptic = useCallback((pattern: HapticName) => {
    if (enabledRef.current) vibrate(pattern);
  }, []);

  const setEnabled = useCallback(
    (enabled: boolean) => {
      enabledRef.current = enabled;
      setSettings((current) => ({ ...current, soundEnabled: enabled }));
      if (enabled) {
        // Preview, played inside the tap that turned sound on.
        playSound('success');
        vibrate('light');
      }
    },
    [setSettings],
  );

  const value = useMemo<SoundContextValue>(
    () => ({ isEnabled: settings.soundEnabled, setEnabled, play, haptic, resetSettings: removeSettings }),
    [settings.soundEnabled, setEnabled, play, haptic, removeSettings],
  );

  return <SoundContext value={value}>{children}</SoundContext>;
}
