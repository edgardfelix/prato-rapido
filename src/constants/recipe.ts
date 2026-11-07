import { PiggyBank, Refrigerator, Zap, type LucideIcon } from 'lucide-react';
import type { RecipeMode } from '@/@types';

export interface QuickAction {
  mode: Exclude<RecipeMode, 'standard'>;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const QUICK_ACTIONS: QuickAction[] = [
  { mode: 'quick10', title: 'Prato Rápido 10min', description: 'Pronto em até 10 minutos', icon: Zap },
  { mode: 'fridgeCleanup', title: 'Limpa Geladeira', description: 'Aproveite o que sobrou', icon: Refrigerator },
  { mode: 'budget', title: 'Econômico do Dia', description: 'Gaste pouco, coma bem', icon: PiggyBank },
];

export const RECIPE_MODE_VALUES: RecipeMode[] = ['standard', 'quick10', 'fridgeCleanup', 'budget'];

export const MODE_LABELS: Record<RecipeMode, string> = {
  standard: 'Receita do dia a dia',
  quick10: 'Prato Rápido 10min',
  fridgeCleanup: 'Limpa Geladeira',
  budget: 'Econômico do Dia',
};

export const INPUT_PLACEHOLDERS: Record<RecipeMode, string> = {
  standard: 'Ex.: 2 ovos, meio tomate, queijo e um resto de arroz',
  quick10: 'O que você tem aí? Ex.: pão, ovo, queijo, tomate',
  fridgeCleanup: 'Liste as sobras e o que está para vencer',
  budget: 'Opcional: diga o que tem. Sem ingredientes, sugerimos um prato barato.',
};
