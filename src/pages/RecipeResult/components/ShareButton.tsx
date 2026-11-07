import { useEffect, useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import styled from 'styled-components';
import type { SavedRecipe } from '@/@types';
import { IconButton } from '@/components/atoms/IconButton';
import { visuallyHidden } from '@/styles/mixins';
import { buildShareText, copyToClipboard } from '../shareText';

const LiveRegion = styled.span`
  ${visuallyHidden}
`;

/** Native share sheet when available, otherwise copies the recipe as text. */
export function ShareButton({ recipe }: { recipe: SavedRecipe }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleShare = async () => {
    const text = buildShareText(recipe.recipe);
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: recipe.recipe.nome_receita, text });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return; // user closed the sheet
      }
    }
    if (await copyToClipboard(text)) setCopied(true);
  };

  return (
    <>
      <IconButton variant="ghost" label={copied ? 'Receita copiada' : 'Compartilhar receita'} onClick={handleShare}>
        {copied ? <Check size={20} /> : <Share2 size={20} />}
      </IconButton>
      <LiveRegion aria-live="polite">{copied ? 'Receita copiada para a área de transferência.' : ''}</LiveRegion>
    </>
  );
}
