import type {
  APIPayload,
  GenerateRecipeResponse,
  TranscribeAudioPayload,
  TranscribeAudioResponse,
} from '../../src/@types/api.ts';
import { env } from '../config/env.ts';
import { getDemoRecipe, getDemoTranscription } from './demo.service.ts';
import { generateRecipeWithGemini, transcribeWithGemini } from './gemini.service.ts';
import { buildRecipeImageUrl } from './image.service.ts';

/** Use-case layer: picks the AI engine (or demo data) and attaches the food photo URL. */
export async function createRecipe(payload: APIPayload): Promise<GenerateRecipeResponse> {
  if (env.demoMode) {
    const recipe = await getDemoRecipe(payload);
    return { recipe, imageUrl: buildRecipeImageUrl(recipe), model: 'demo', isDemo: true };
  }

  const { recipe, model } = await generateRecipeWithGemini(payload);
  return { recipe, imageUrl: buildRecipeImageUrl(recipe), model, isDemo: false };
}

export async function transcribeAudio({ audio }: TranscribeAudioPayload): Promise<TranscribeAudioResponse> {
  if (env.demoMode) return { text: await getDemoTranscription(), isDemo: true };
  return { text: await transcribeWithGemini(audio), isDemo: false };
}
