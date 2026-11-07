import type { RecipeResponse } from '../../src/@types/recipe.ts';
import { HttpError } from '../utils/httpError.ts';
import { cleanText, isRecord, stripCodeFence } from './common.ts';

const MAX = {
  name: 120,
  time: 40,
  difficulty: 30,
  ingredient: 160,
  step: 700,
  tip: 700,
  imagePrompt: 400,
  ingredients: 20,
  steps: 12,
  transcription: 1_500,
} as const;

const DIFFICULTIES = new Set(['Fácil', 'Média', 'Difícil']);
const STEP_NUMBERING = /^\s*(?:passo\s*)?\d{1,2}\s*[.):\-–]\s*/i;

const invalidResponse = () =>
  new HttpError(502, 'AI_INVALID_RESPONSE', 'A IA respondeu em um formato inesperado. Tente novamente.');

function parseJson(raw: string): Record<string, unknown> {
  let data: unknown;
  try {
    data = JSON.parse(stripCodeFence(raw));
  } catch {
    throw invalidResponse();
  }
  if (!isRecord(data)) throw invalidResponse();
  return data;
}

function cleanList(value: unknown, maxItems: number, maxChars: number, transform = (text: string) => text): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => transform(cleanText(item, maxChars)))
    .filter(Boolean)
    .slice(0, maxItems);
}

/** Validates and sanitizes the model output before it reaches the client. */
export function parseRecipeResponse(raw: string): RecipeResponse {
  const data = parseJson(raw);

  const recipe: RecipeResponse = {
    nome_receita: cleanText(data.nome_receita, MAX.name),
    tempo_preparo: cleanText(data.tempo_preparo, MAX.time) || '15 min',
    dificuldade: cleanText(data.dificuldade, MAX.difficulty),
    ingredientes_utilizados: cleanList(data.ingredientes_utilizados, MAX.ingredients, MAX.ingredient),
    passo_a_passo: cleanList(data.passo_a_passo, MAX.steps, MAX.step, (step) => step.replace(STEP_NUMBERING, '')),
    dica_do_chef: cleanText(data.dica_do_chef, MAX.tip),
    prompt_imagem: cleanText(data.prompt_imagem, MAX.imagePrompt),
  };

  if (recipe.ingredientes_utilizados.length === 0) {
    throw new HttpError(
      422,
      'NO_INGREDIENTS',
      'Não encontrei ingredientes no texto ou na foto. Tente outra foto ou digite o que você tem.',
    );
  }
  if (!recipe.nome_receita || recipe.passo_a_passo.length === 0) throw invalidResponse();
  if (!DIFFICULTIES.has(recipe.dificuldade)) recipe.dificuldade = 'Fácil';
  if (!recipe.prompt_imagem) recipe.prompt_imagem = recipe.nome_receita;

  return recipe;
}

export function parseTranscription(raw: string): string {
  const data = parseJson(raw);
  if (typeof data.transcricao !== 'string') throw invalidResponse();
  return cleanText(data.transcricao, MAX.transcription);
}
