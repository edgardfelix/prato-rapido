import { useEffect, useState } from 'react';
import { toDateKey } from '@/utils/date';

/** Today's local date key, updated at midnight and when the app comes back to the foreground. */
export function useToday(): string {
  const [today, setToday] = useState(() => toDateKey());

  useEffect(() => {
    const refresh = () => setToday(toDateKey());
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
    const timer = window.setTimeout(refresh, nextMidnight.getTime() - now.getTime());
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [today]);

  return today;
}
