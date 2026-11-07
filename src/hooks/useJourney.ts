import { useContext } from 'react';
import { JourneyContext, type JourneyContextValue } from '@/context/JourneyContext';

export function useJourney(): JourneyContextValue {
  const context = useContext(JourneyContext);
  if (!context) throw new Error('useJourney must be used inside <JourneyProvider>.');
  return context;
}
