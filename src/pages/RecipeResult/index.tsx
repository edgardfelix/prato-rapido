import { ArrowLeft, House, RotateCcw } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { IconButton } from '@/components/atoms/IconButton';
import { Header } from '@/components/organisms/Header';
import { Loader } from '@/components/organisms/Loader';
import { Page, PageContent } from '@/components/templates/PageLayout';
import { useRecipes } from '@/hooks/useRecipes';
import { RecipeDetails } from './components/RecipeDetails';
import { ShareButton } from './components/ShareButton';
import { StatusView } from './components/StatusView';

/**
 * `/receita/:id` shows a saved recipe, the skeleton while that id is being
 * generated, or a recoverable error state.
 */
export default function RecipeResult() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getRecipe, pending, retryPending, generateVariation, canGenerateVariation } = useRecipes();

  const saved = getRecipe(id);
  const generation = pending?.id === id ? pending : null;

  // Pop back to Home when it is in the history stack; replace when the page was opened directly.
  const goBack = () => {
    if (location.key !== 'default') navigate(-1);
    else navigate('/', { replace: true });
  };

  const handleGenerateAnother = () => {
    if (!saved) return;
    const nextId = generateVariation(saved);
    if (nextId) navigate(`/receita/${nextId}`, { replace: true });
  };

  const title = saved ? 'Sua receita' : generation?.status === 'loading' ? 'Preparando sua receita' : undefined;

  return (
    <Page>
      <Header
        leading={
          <IconButton variant="ghost" label="Voltar" onClick={goBack}>
            <ArrowLeft size={20} />
          </IconButton>
        }
        title={title}
        trailing={saved ? <ShareButton recipe={saved} /> : undefined}
      />

      <PageContent>
        {saved ? (
          <RecipeDetails
            key={saved.id}
            saved={saved}
            canGenerateAnother={canGenerateVariation(saved)}
            onGenerateAnother={handleGenerateAnother}
            onGoHome={goBack}
          />
        ) : generation?.status === 'loading' ? (
          <Loader />
        ) : generation?.status === 'error' ? (
          <StatusView
            tone="error"
            title="Não deu para preparar sua receita"
            message={generation.error?.message}
            primaryAction={{ label: 'Tentar novamente', icon: RotateCcw, onClick: retryPending }}
            secondaryAction={{ label: 'Editar ingredientes', onClick: goBack }}
          />
        ) : (
          <StatusView
            tone="empty"
            title="Receita não encontrada"
            message="Ela pode ter sido removida do histórico deste aparelho."
            primaryAction={{ label: 'Voltar ao início', icon: House, onClick: () => navigate('/', { replace: true }) }}
          />
        )}
      </PageContent>
    </Page>
  );
}
