import { useContext } from 'react';
import { AccessContext, type AccessContextValue } from '@/context/AccessContext';

export function useAccess(): AccessContextValue {
  const context = useContext(AccessContext);
  if (!context) throw new Error('useAccess must be used inside <AccessProvider>.');
  return context;
}
