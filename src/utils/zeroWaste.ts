import { SAVINGS_PER_MEAL_BRL } from '@/constants/journey';
import { WASTE_ITEM_VALUE_BRL, WASTE_MAX_ITEMS, WEEKS_PER_MONTH } from '@/constants/zeroWaste';

export interface WasteEstimate {
  /** Monthly loss, rounded to R$ 5 (the UI says "cerca de"). */
  monthlyLoss: number;
  /**
   * Days of home cooking that pay the loss back, at the same per-meal saving
   * the Jornada uses ("evitando delivery"). 0 when nothing is wasted.
   */
  recoveryDays: number;
}

export function estimateWaste(itemsPerWeek: number): WasteEstimate {
  const items = Math.max(0, Math.min(WASTE_MAX_ITEMS, Math.round(itemsPerWeek)));
  const monthlyLoss = Math.round((items * WASTE_ITEM_VALUE_BRL * WEEKS_PER_MONTH) / 5) * 5;
  const recoveryDays = monthlyLoss > 0 ? Math.max(1, Math.ceil(monthlyLoss / SAVINGS_PER_MEAL_BRL)) : 0;
  return { monthlyLoss, recoveryDays };
}
