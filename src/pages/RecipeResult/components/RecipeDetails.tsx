import { useState } from 'react';
import { Boxes, ChefHat, ChevronRight, Clock, Gauge, House, ListChecks, RefreshCw, UtensilsCrossed } from 'lucide-react';
import type { SavedRecipe } from '@/@types';
import { Button } from '@/components/atoms/Button';
import { Tag } from '@/components/atoms/Tag';
import { ChefTip } from '@/components/molecules/ChefTip';
import { InlineAlert } from '@/components/molecules/InlineAlert';
import { CookingFocusMode } from '@/components/modals/CookingFocusMode';
import { IngredientChecklist } from '@/components/organisms/IngredientChecklist';
import { RecipeImage } from '@/components/organisms/RecipeImage';
import { StepList } from '@/components/organisms/StepList';
import { MODE_LABELS, QUICK_ACTIONS } from '@/constants/recipe';
import { useJourney } from '@/hooks/useJourney';
import { useSound } from '@/hooks/useSound';
import { useToast } from '@/hooks/useToast';
import * as S from '../styles';
import { WhatsAppListButton } from './WhatsAppListButton';

interface RecipeDetailsProps {
  saved: SavedRecipe;
  canGenerateAnother: boolean;
  onGenerateAnother: () => void;
  onGoHome: () => void;
}

export function RecipeDetails({ saved, canGenerateAnother, onGenerateAnother, onGoHome }: RecipeDetailsProps) {
  const { recipe } = saved;
  const modeIcon = QUICK_ACTIONS.find((action) => action.mode === saved.mode)?.icon;
  const [isCooking, setIsCooking] = useState(false);
  // Ingredients ticked as "separados": they go to the WhatsApp list as "já tenho".
  const [owned, setOwned] = useState<ReadonlySet<number>>(() => new Set());
  const { completeToday } = useJourney();
  const { notify } = useToast();
  const { play } = useSound();

  const toggleOwned = (index: number) =>
    setOwned((previous) => {
      const next = new Set(previous);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  /** Finishing the dish in Modo Cozinha checks off today's journey day (which opens its celebration). */
  const handleFinishCooking = () => {
    setIsCooking(false);
    if (completeToday().status === 'completed') return;
    play('success');
    notify({ id: 'cooking-done', icon: UtensilsCrossed, title: 'Prato pronto!', description: 'Bom apetite!' });
  };

  return (
    <S.Article>
      <RecipeImage key={saved.imageUrl} src={saved.imageUrl} alt={`Foto ilustrativa do prato ${recipe.nome_receita}`} />

      <S.TitleBlock>
        {(saved.mode !== 'standard' || saved.source.batchCooking) && (
          <S.TagRow>
            {saved.mode !== 'standard' && (
              <Tag tone="primary" icon={modeIcon}>
                {MODE_LABELS[saved.mode]}
              </Tag>
            )}
            {saved.source.batchCooking && (
              <Tag tone="primary" icon={Boxes}>
                Marmitas · até 4 dias
              </Tag>
            )}
          </S.TagRow>
        )}
        <S.Title>{recipe.nome_receita}</S.Title>
      </S.TitleBlock>

      <S.Stats>
        <S.Stat>
          <Clock size={20} aria-hidden="true" />
          <strong>{recipe.tempo_preparo}</strong>
          <span>Preparo</span>
        </S.Stat>
        <S.Stat>
          <Gauge size={20} aria-hidden="true" />
          <strong>{recipe.dificuldade}</strong>
          <span>Dificuldade</span>
        </S.Stat>
        <S.Stat>
          <ListChecks size={20} aria-hidden="true" />
          <strong>{recipe.ingredientes_utilizados.length}</strong>
          <span>Ingredientes</span>
        </S.Stat>
      </S.Stats>

      <S.CookingModeButton type="button" aria-haspopup="dialog" onClick={() => setIsCooking(true)}>
        <S.CookingModeIcon aria-hidden="true">
          <ChefHat size={22} />
        </S.CookingModeIcon>
        <S.CookingModeTexts>
          <strong>Iniciar Modo Cozinha</strong>
          <span>Passo a passo em tela cheia, letras grandes e tela sempre ligada</span>
        </S.CookingModeTexts>
        <ChevronRight size={20} aria-hidden="true" />
      </S.CookingModeButton>

      {saved.isDemo && (
        <InlineAlert tone="warning" title="Receita de demonstração">
          O servidor está sem a GEMINI_API_KEY, então esta é uma receita de exemplo. Adicione sua chave gratuita no
          arquivo .env para gerar receitas reais com os seus ingredientes.
        </InlineAlert>
      )}

      <IngredientChecklist items={recipe.ingredientes_utilizados} checked={owned} onToggle={toggleOwned} />
      <WhatsAppListButton recipe={recipe} owned={owned} />
      <StepList steps={recipe.passo_a_passo} />
      {recipe.dica_do_chef && <ChefTip tip={recipe.dica_do_chef} />}

      <S.Actions>
        <Button
          size="lg"
          fullWidth
          leftIcon={<RefreshCw size={18} />}
          onClick={onGenerateAnother}
          disabled={!canGenerateAnother}
        >
          Gerar outra opção
        </Button>
        {!canGenerateAnother && (
          <S.ActionHint>Para outra opção com esta foto, envie a imagem de novo na tela inicial.</S.ActionHint>
        )}
        <Button size="lg" variant="ghost" fullWidth leftIcon={<House size={18} />} onClick={onGoHome}>
          Voltar ao início
        </Button>
      </S.Actions>

      {isCooking && (
        <CookingFocusMode recipe={recipe} onClose={() => setIsCooking(false)} onFinish={handleFinishCooking} />
      )}
    </S.Article>
  );
}
