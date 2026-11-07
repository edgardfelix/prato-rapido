import { useCallback } from 'react';
import { STORAGE_KEYS } from '@/constants/storage';
import { removeAppStorage } from '@/utils/storage';
import { useJourney } from './useJourney';
import { useRecipes } from './useRecipes';
import { useSound } from './useSound';
import { useUser } from './useUser';

/**
 * "Resetar progresso" and "Apagar dados da conta". Each provider resets its
 * own in-memory state (so the UI immediately shows the defaults) and then any
 * leftover key of the app is swept from localStorage.
 */
export function useAccountReset() {
  const { clearUser } = useUser();
  const { clearHistory } = useRecipes();
  const { resetJourney, clearJourney } = useJourney();
  const { resetSettings } = useSound();

  /** Journey (days, water, badges) and recipe history. Badges are computed from both, so both go. */
  const resetProgress = useCallback(() => {
    clearHistory();
    resetJourney();
  }, [clearHistory, resetJourney]);

  /** Everything except the theme, the human verification and the paid access of this device. */
  const deleteAccountData = useCallback(() => {
    clearHistory();
    clearJourney();
    resetSettings();
    clearUser();
    removeAppStorage([STORAGE_KEYS.theme, STORAGE_KEYS.verification, STORAGE_KEYS.access, STORAGE_KEYS.paywall]);
  }, [clearHistory, clearJourney, resetSettings, clearUser]);

  return { resetProgress, deleteAccountData };
}
