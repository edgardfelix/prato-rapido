import { useContext } from 'react';
import { HumanCheckContext, type HumanCheckContextValue } from '@/context/HumanCheckContext';

export function useHumanCheck(): HumanCheckContextValue {
  const context = useContext(HumanCheckContext);
  if (!context) throw new Error('useHumanCheck must be used inside <HumanCheckProvider>.');
  return context;
}
