import type { RecipeResponse } from '@/@types';

export const WHATSAPP_SHARE_URL = 'https://api.whatsapp.com/send';

const MAX_ITEMS = 30;

/** Plain line of text: WhatsApp markers (* _ ~ `) and line breaks are removed so no item can break the layout. */
const plain = (text: string, maxChars: number) =>
  text
    .replace(/[*_~`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxChars);

/**
 * Shopping list formatted as a WhatsApp checklist. Ingredients the user
 * already ticked in the recipe ("já tenho") go to a separate, struck-through
 * section, so the list shows only what is left to buy.
 */
export function buildShoppingListText(recipe: RecipeResponse, owned: ReadonlySet<number> = new Set()): string {
  const items = recipe.ingredientes_utilizados
    .slice(0, MAX_ITEMS)
    .map((item, index) => ({ text: plain(item, 120), owned: owned.has(index) }))
    .filter((item) => item.text);
  const toBuy = items.filter((item) => !item.owned);
  const alreadyHave = items.filter((item) => item.owned);

  const lines = [
    '🛒 *Lista de compras · Prato Rápido*',
    `🍽️ ${plain(recipe.nome_receita, 100)} (${plain(recipe.tempo_preparo, 20)})`,
    '',
    ...(toBuy.length > 0 ? toBuy.map((item) => `☐ ${item.text}`) : ['✅ Você já tem todos os ingredientes!']),
  ];
  if (alreadyHave.length > 0) {
    lines.push('', '*Já tenho:*', ...alreadyHave.map((item) => `✅ ~${item.text}~`));
  }
  lines.push('', 'Receita criada com o Prato Rápido');
  return lines.join('\n');
}

/** Native WhatsApp share link (opens the app on phones, WhatsApp Web on desktops). */
export const buildWhatsAppShareUrl = (text: string): string => `${WHATSAPP_SHARE_URL}?text=${encodeURIComponent(text)}`;
