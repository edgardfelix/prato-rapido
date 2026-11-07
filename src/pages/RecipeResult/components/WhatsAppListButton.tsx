import { MessageCircle, Send } from 'lucide-react';
import type { RecipeResponse } from '@/@types';
import { useSound } from '@/hooks/useSound';
import { buildShoppingListText, buildWhatsAppShareUrl } from '@/services/whatsapp';
import * as S from '../styles';

interface WhatsAppListButtonProps {
  recipe: RecipeResponse;
  /** Ingredients ticked in the checklist (sent as "já tenho"). */
  owned: ReadonlySet<number>;
}

/** Opens WhatsApp with the ingredient checklist (a real link, so popup blockers never get in the way). */
export function WhatsAppListButton({ recipe, owned }: WhatsAppListButtonProps) {
  const { play } = useSound();
  const total = recipe.ingredientes_utilizados.length;
  const toBuy = total - owned.size;
  const href = buildWhatsAppShareUrl(buildShoppingListText(recipe, owned));
  const detail =
    owned.size > 0
      ? `${toBuy} para comprar · ${owned.size} marcado${owned.size === 1 ? '' : 's'} como “já tenho”`
      : `${total} ${total === 1 ? 'item' : 'itens'} em formato de checklist`;

  return (
    <S.WhatsAppLink href={href} target="_blank" rel="noopener noreferrer" onClick={() => play('tap')}>
      <S.WhatsAppIcon aria-hidden="true">
        <MessageCircle size={22} strokeWidth={2.4} />
      </S.WhatsAppIcon>
      <S.CookingModeTexts>
        <strong>Enviar Lista de Compras para o WhatsApp</strong>
        <span>{detail}</span>
      </S.CookingModeTexts>
      <Send size={18} aria-hidden="true" />
      <S.VisuallyHidden> (abre o WhatsApp em uma nova aba)</S.VisuallyHidden>
    </S.WhatsAppLink>
  );
}
