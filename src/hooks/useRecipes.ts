import { useContext } from 'react';
import { RecipeContext, type RecipeContextValue } from '@/context/RecipeContext';

export function useRecipes(): RecipeContextValue {
  const context = useContext(RecipeContext);
  if (!context) throw new Error('useRecipes must be used inside <RecipeProvider>.');
  return context;
}
