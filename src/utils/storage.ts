import { STORAGE_PREFIX } from '@/constants/storage';

/**
 * Removes every key of this app from localStorage except `keep`. Other apps on
 * the same origin are untouched (only keys with our prefix are considered).
 * Never throws: storage may be unavailable (private mode, blocked cookies).
 */
export function removeAppStorage(keep: readonly string[] = []): void {
  try {
    const keys: string[] = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(STORAGE_PREFIX) && !keep.includes(key)) keys.push(key);
    }
    for (const key of keys) window.localStorage.removeItem(key);
  } catch {
    // Nothing else to do: the in-memory state has already been reset by the providers.
  }
}
