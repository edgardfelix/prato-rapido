import type {
  APIPayload,
  GenerateRecipeResponse,
  HumanChallenge,
  HumanChallengeAnswer,
  HumanVerification,
  TranscribeAudioPayload,
  TranscribeAudioResponse,
} from '@/@types';
import { getJson, postJson } from './httpClient';

/** REST client for the Prato Rápido API (secure proxy in front of Gemini). */
export const recipeService = {
  generateRecipe(payload: APIPayload, signal?: AbortSignal): Promise<GenerateRecipeResponse> {
    return postJson<GenerateRecipeResponse>('/api/generate-recipe', payload, { signal, timeoutMs: 70_000, humanCheck: true });
  },

  transcribeAudio(payload: TranscribeAudioPayload, signal?: AbortSignal): Promise<TranscribeAudioResponse> {
    return postJson<TranscribeAudioResponse>('/api/transcribe', payload, { signal, timeoutMs: 45_000, humanCheck: true });
  },
};

/** "Verificação rápida": stateless challenge signed by the server. */
export const verificationService = {
  getChallenge(signal?: AbortSignal): Promise<HumanChallenge> {
    return getJson<HumanChallenge>('/api/challenge', { signal, timeoutMs: 15_000 });
  },

  verify(answer: HumanChallengeAnswer, signal?: AbortSignal): Promise<HumanVerification> {
    return postJson<HumanVerification>('/api/challenge/verify', answer, { signal, timeoutMs: 15_000 });
  },
};
