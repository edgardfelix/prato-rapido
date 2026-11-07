import { useCallback, useRef } from 'react';
import { Boxes, Check, ChefHat, ChevronRight, Leaf, Timer } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { AudioRecording, RecipeMode } from '@/@types';
import { Avatar } from '@/components/atoms/Avatar';
import { Spinner } from '@/components/atoms/Spinner';
import { Tag } from '@/components/atoms/Tag';
import { QuickActionCard } from '@/components/molecules/QuickActionCard';
import { Header } from '@/components/organisms/Header';
import { MultiFormatInput } from '@/components/organisms/MultiFormatInput';
import { Page, PageContent, Section, SectionHeader, SectionTitle } from '@/components/templates/PageLayout';
import { COOKING_LEVEL_LABELS, DIETARY_LABELS, TIME_LABELS } from '@/constants/quiz';
import { QUICK_ACTIONS } from '@/constants/recipe';
import { useRecipes } from '@/hooks/useRecipes';
import { useSound } from '@/hooks/useSound';
import { useUser } from '@/hooks/useUser';
import { recipeService } from '@/services/recipeService';
import { getFirstName, getGreeting } from '@/utils/format';
import { prefersReducedMotion } from '@/utils/motion';
import { JourneyTeaser } from './components/JourneyTeaser';
import { RecentRecipes } from './components/RecentRecipes';
import { ZeroWasteCalculator } from './components/ZeroWasteCalculator';
import * as S from './styles';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { draft, setDraft, mode, setMode, batchCooking, setBatchCooking, generateRecipe, history, pending } = useRecipes();
  const { play } = useSound();
  const composerRef = useRef<HTMLDivElement>(null);

  const handleSelectMode = useCallback(
    (selected: RecipeMode) => setMode((current) => (current === selected ? 'standard' : selected)),
    [setMode],
  );
  const handleClearMode = useCallback(() => setMode('standard'), [setMode]);

  const handleToggleBatch = () => {
    play(batchCooking ? 'uncheck' : 'check');
    setBatchCooking((current) => !current);
  };

  /** Zero-waste calculator CTA: pick "Limpa Geladeira" and bring the composer into view. */
  const handleUseFridgeCleanup = () => {
    play('tap');
    setMode('fridgeCleanup');
    composerRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  };

  const handleTranscribe = useCallback(async (recording: AudioRecording, signal: AbortSignal) => {
    const response = await recipeService.transcribeAudio(
      { audio: { base64: recording.base64, mimeType: recording.mimeType } },
      signal,
    );
    return response.text;
  }, []);

  const handleSubmit = () => {
    const id = generateRecipe({
      ingredientsText: draft.text.trim(),
      // Only the binary goes to the API; the preview data URL stays on the device.
      image: draft.image ? { base64: draft.image.base64, mimeType: draft.image.mimeType } : undefined,
      mode,
      batchCooking,
    });
    if (id) navigate(`/receita/${id}`);
  };

  if (!user) return null;

  const isGenerating = pending?.status === 'loading';
  const { cookingLevel, dietaryRestrictions, timeAvailable } = user.quiz;

  return (
    <Page>
      <Header />

      <PageContent>
        <S.Greeting>
          <S.GreetingRow>
            <S.AvatarLink to="/profile" aria-label="Abrir seu perfil">
              <Avatar avatar={user.avatar} name={user.name} size={52} />
            </S.AvatarLink>
            <div>
              <S.Hello>{getGreeting()},</S.Hello>
              <S.Name>{getFirstName(user.name)}</S.Name>
            </div>
          </S.GreetingRow>
          <S.Subtitle>O que tem aí para cozinhar hoje?</S.Subtitle>
          <S.Tags>
            <Tag icon={ChefHat}>{COOKING_LEVEL_LABELS[cookingLevel]}</Tag>
            <Tag icon={Timer}>{TIME_LABELS[timeAvailable]}</Tag>
            {dietaryRestrictions.map((restriction) => (
              <Tag key={restriction} icon={Leaf} tone="primary">
                {DIETARY_LABELS[restriction]}
              </Tag>
            ))}
          </S.Tags>
        </S.Greeting>

        <JourneyTeaser />

        {isGenerating && pending && (
          <S.PendingBanner type="button" onClick={() => navigate(`/receita/${pending.id}`)}>
            <Spinner size={18} />
            <span>Sua receita está sendo preparada…</span>
            <strong>Ver</strong>
            <ChevronRight size={18} aria-hidden="true" />
          </S.PendingBanner>
        )}

        <Section aria-labelledby="quick-actions-title">
          <SectionHeader>
            <SectionTitle id="quick-actions-title">Atalhos rápidos</SectionTitle>
          </SectionHeader>
          <S.QuickGrid>
            {QUICK_ACTIONS.map((action) => (
              <QuickActionCard
                key={action.mode}
                action={action}
                selected={mode === action.mode}
                onSelect={handleSelectMode}
              />
            ))}
          </S.QuickGrid>
          <S.BatchToggle type="button" aria-pressed={batchCooking} $active={batchCooking} onClick={handleToggleBatch}>
            <S.BatchIcon $active={batchCooking} aria-hidden="true">
              <Boxes size={20} />
            </S.BatchIcon>
            <S.BatchTexts>
              <strong>Modo Marmitas</strong>
              <span>Até 4 dias na geladeira · porções para a semana</span>
            </S.BatchTexts>
            <S.BatchCheck $active={batchCooking} aria-hidden="true">
              <Check size={14} strokeWidth={3} />
            </S.BatchCheck>
          </S.BatchToggle>
        </Section>

        <S.Composer ref={composerRef}>
          <MultiFormatInput
            value={draft}
            onChange={setDraft}
            onSubmit={handleSubmit}
            onTranscribeAudio={handleTranscribe}
            mode={mode}
            onClearMode={handleClearMode}
            isSubmitting={isGenerating}
          />
        </S.Composer>

        <ZeroWasteCalculator onUseFridgeCleanup={handleUseFridgeCleanup} />

        <RecentRecipes recipes={history} />
      </PageContent>
    </Page>
  );
}
