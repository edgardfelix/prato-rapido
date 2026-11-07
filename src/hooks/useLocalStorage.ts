import { useCallback, useEffect, useRef, useState, type SetStateAction } from 'react';

/** Turns whatever was stored into a valid value, or returns the fallback. */
export type StorageSanitizer<T> = (value: unknown, fallback: T) => T;

function readStorage<T>(key: string, fallback: T, sanitize?: StorageSanitizer<T>): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return sanitize ? sanitize(parsed, fallback) : (parsed as T);
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded or storage disabled (private mode): keep the in-memory state.
  }
}

/**
 * `useState` persisted in localStorage, validated on read and synchronized
 * across tabs through the `storage` event.
 */
export function useLocalStorage<T>(key: string, initialValue: T, sanitize?: StorageSanitizer<T>) {
  const initialValueRef = useRef(initialValue);
  const sanitizeRef = useRef(sanitize);
  const [value, setValue] = useState<T>(() => readStorage(key, initialValue, sanitize));
  const valueRef = useRef(value);

  const setStoredValue = useCallback(
    (action: SetStateAction<T>) => {
      const next =
        typeof action === 'function' ? (action as (previous: T) => T)(valueRef.current) : action;
      valueRef.current = next;
      setValue(next);
      writeStorage(key, next);
    },
    [key],
  );

  const removeStoredValue = useCallback(() => {
    valueRef.current = initialValueRef.current;
    setValue(initialValueRef.current);
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Storage unavailable: nothing to remove.
    }
  }, [key]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) return;
      if (event.key !== null && event.key !== key) return;
      const next =
        event.key === null || event.newValue === null
          ? initialValueRef.current
          : readStorage(key, initialValueRef.current, sanitizeRef.current);
      valueRef.current = next;
      setValue(next);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key]);

  return [value, setStoredValue, removeStoredValue] as const;
}
