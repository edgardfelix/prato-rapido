import { useCallback, useLayoutEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import type { MediaAttachment, RecipeMode, SavedRecipe } from '@/@types';
import { LIMITS } from '@/constants/limits';
import { STORAGE_KEYS } from '@/constants/storage';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useUser } from '@/hooks/useUser';
import { ApiClientError, getErrorMessage } from '@/services/httpClient';
import { buildRecipePayload } from '@/services/recipePayload';
import { recipeService } from '@/services/recipeService';
import { createId } from '@/utils/id';
import { sanitizeHistory } from '@/utils/validators';
import {
  RecipeContext,
  type InputDraft,
  type PendingGeneration,
  type RecipeContextValue,
  type RecipeRequest,
} from './RecipeContext';

const EMPTY_DRAFT: InputDraft = { text: '', image: null };

type GenerationJob = Omit<PendingGeneration, 'status' | 'error'>;

/**
 * Owns the recipe generation lifecycle: the Home draft, the request in flight,
 * cancellation of superseded requests and the persisted history.
 */
export function RecipeProvider({ children }: PropsWithChildren) {
  const { user } = useUser();
  const [history, setHistory, removeHistory] = useLocalStorage<SavedRecipe[]>(
    STORAGE_KEYS.history,
    [],
    sanitizeHistory,
  );
  const [draft, setDraft] = useState<InputDraft>(EMPTY_DRAFT);
  const [mode, setMode] = useState<RecipeMode>('standard');
  const [batchCooking, setBatchCooking] = useState(false);
  const [pending, setPending] = useState<PendingGeneration | null>(null);

  const userRef = useRef(user);
  const abortRef = useRef<AbortController | null>(null);
  // Photos are too heavy for localStorage, so they are kept for this session only.
  const sessionImagesRef = useRef(new Map<string, MediaAttachment>());

  useLayoutEffect(() => {
    userRef.current = user;
  });

  const run = useCallback(
    async (job: GenerationJob) => {
      const currentUser = userRef.current;
      if (!currentUser) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setPending({ ...job, status: 'loading' });

      const { id, request, avoidRecipes } = job;
      try {
        // Sanitized, allow-listed payload: only what changes the recipe (never name, e-mail or avatar).
        const response = await recipeService.generateRecipe(
          buildRecipePayload(request, currentUser, avoidRecipes),
          controller.signal,
        );
        if (controller.signal.aborted) return;

        if (request.image) sessionImagesRef.current.set(id, request.image);
        const saved: SavedRecipe = {
          id,
          createdAt: new Date().toISOString(),
          mode: request.mode,
          recipe: response.recipe,
          imageUrl: response.imageUrl,
          isDemo: response.isDemo,
          source: {
            ingredientsText: request.ingredientsText,
            hasImage: Boolean(request.image),
            avoidRecipes,
            batchCooking: request.batchCooking,
          },
        };
        setHistory((previous) => [saved, ...previous.filter((item) => item.id !== id)].slice(0, LIMITS.historySize));
        setPending((current) => (current?.id === id ? null : current));
        if (job.clearDraftOnSuccess) {
          setDraft(EMPTY_DRAFT);
          setMode('standard');
          setBatchCooking(false);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        const code = error instanceof ApiClientError ? error.code : 'INTERNAL';
        setPending((current) =>
          current?.id === id ? { ...current, status: 'error', error: { code, message: getErrorMessage(error) } } : current,
        );
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [setHistory],
  );

  const generateRecipe = useCallback(
    (request: RecipeRequest) => {
      if (!userRef.current) return null;
      const id = createId();
      void run({ id, request, avoidRecipes: [], clearDraftOnSuccess: true });
      return id;
    },
    [run],
  );

  const retryPending = useCallback(() => {
    if (!pending) return;
    const { id, request, avoidRecipes, clearDraftOnSuccess } = pending;
    void run({ id, request, avoidRecipes, clearDraftOnSuccess });
  }, [pending, run]);

  const canGenerateVariation = useCallback(
    (recipe: SavedRecipe) =>
      recipe.source.ingredientsText.trim().length > 0 ||
      sessionImagesRef.current.has(recipe.id) ||
      recipe.mode === 'budget',
    [],
  );

  const generateVariation = useCallback(
    (recipe: SavedRecipe) => {
      if (!userRef.current || !canGenerateVariation(recipe)) return null;
      const id = createId();
      const avoidRecipes = [...recipe.source.avoidRecipes, recipe.recipe.nome_receita].slice(-LIMITS.avoidRecipesMax);
      void run({
        id,
        request: {
          ingredientsText: recipe.source.ingredientsText,
          image: sessionImagesRef.current.get(recipe.id),
          mode: recipe.mode,
          batchCooking: recipe.source.batchCooking,
        },
        avoidRecipes,
        clearDraftOnSuccess: false,
      });
      return id;
    },
    [canGenerateVariation, run],
  );

  const getRecipe = useCallback((id: string) => history.find((item) => item.id === id), [history]);

  const clearHistory = useCallback(() => {
    abortRef.current?.abort();
    sessionImagesRef.current.clear();
    setPending(null);
    setDraft(EMPTY_DRAFT);
    setMode('standard');
    setBatchCooking(false);
    removeHistory();
  }, [removeHistory]);

  const value = useMemo<RecipeContextValue>(
    () => ({
      history,
      pending,
      draft,
      setDraft,
      mode,
      setMode,
      batchCooking,
      setBatchCooking,
      generateRecipe,
      retryPending,
      generateVariation,
      canGenerateVariation,
      getRecipe,
      clearHistory,
    }),
    [
      history,
      pending,
      draft,
      mode,
      batchCooking,
      generateRecipe,
      retryPending,
      generateVariation,
      canGenerateVariation,
      getRecipe,
      clearHistory,
    ],
  );

  return <RecipeContext value={value}>{children}</RecipeContext>;
}
