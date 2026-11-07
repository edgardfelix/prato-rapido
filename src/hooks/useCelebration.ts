import { useContext } from 'react';
import { CelebrationContext, type CelebrationContextValue } from '@/context/CelebrationContext';

export function useCelebration(): CelebrationContextValue {
  const context = useContext(CelebrationContext);
  if (!context) throw new Error('useCelebration must be used inside <CelebrationProvider>.');
  return context;
}
