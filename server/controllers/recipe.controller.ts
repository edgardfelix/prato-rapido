import type { Request, Response } from 'express';
import type { HealthResponse } from '../../src/@types/api.ts';
import { env } from '../config/env.ts';
import { createRecipe, transcribeAudio } from '../services/recipe.service.ts';
import { validateRecipePayload, validateTranscribePayload } from '../validation/payload.validator.ts';

/* Thin HTTP adapters: validate → call the use case → serialize. Express 5 forwards rejections to the error handler. */

export async function generateRecipeHandler(req: Request, res: Response): Promise<void> {
  const payload = validateRecipePayload(req.body);
  const result = await createRecipe(payload);
  res.status(200).json(result);
}

export async function transcribeAudioHandler(req: Request, res: Response): Promise<void> {
  const payload = validateTranscribePayload(req.body);
  const result = await transcribeAudio(payload);
  res.status(200).json(result);
}

export function healthHandler(_req: Request, res: Response): void {
  const body: HealthResponse = {
    status: 'ok',
    mode: env.demoMode ? 'demo' : 'ai',
    model: env.demoMode ? null : env.gemini.model,
  };
  res.json(body);
}
