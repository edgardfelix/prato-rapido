import type { RecipeResponse } from '@/@types';

/** Plain-text version of a recipe for the native share sheet / clipboard. */
export function buildShareText(recipe: RecipeResponse): string {
  return [
    recipe.nome_receita,
    `Tempo: ${recipe.tempo_preparo} · Dificuldade: ${recipe.dificuldade}`,
    '',
    'Ingredientes:',
    ...recipe.ingredientes_utilizados.map((item) => `• ${item}`),
    '',
    'Modo de preparo:',
    ...recipe.passo_a_passo.map((step, index) => `${index + 1}. ${step}`),
    '',
    `Dica do chef: ${recipe.dica_do_chef}`,
    '',
    'Receita criada com o Prato Rápido',
  ].join('\n');
}

/** Clipboard API with a legacy fallback for insecure contexts (e.g. LAN testing over HTTP). */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy strategy.
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
}
