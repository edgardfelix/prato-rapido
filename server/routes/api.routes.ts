import { Router } from 'express';
import { env } from '../config/env.ts';
import { SERVER_LIMITS } from '../config/limits.ts';
import { accessStatusHandler, verifyEmailHandler } from '../controllers/access.controller.ts';
import { challengeHandler, verifyChallengeHandler } from '../controllers/challenge.controller.ts';
import { recipeImageHandler } from '../controllers/image.controller.ts';
import { generateRecipeHandler, healthHandler, transcribeAudioHandler } from '../controllers/recipe.controller.ts';
import { apiNotFound } from '../middleware/errorHandler.ts';
import { createRateLimiter } from '../middleware/rateLimiter.ts';
import { jsonBody, requireAccess, requireHuman } from '../middleware/requestGuards.ts';
import { createWebhookRouter } from './webhook.routes.ts';

/*
 * Guard order for the AI routes, cheapest first: per-IP limit → buyer access
 * token (paywall) → human token (header only) → per-token limit → Content-Type
 * → size-limited JSON parse → strict validation in the controller. Oversized,
 * unpaid or unauthenticated bodies are rejected before they are read.
 */
export function createApiRouter(): Router {
  const router = Router();
  const windowMs = SERVER_LIMITS.rateLimitWindowMs;
  const ipLimit = (name: string, max = env.rateLimitPerMinute) => createRateLimiter({ name, windowMs, max });
  // One budget per verified browser, shared by every AI route.
  const humanLimit = createRateLimiter({
    name: 'ai-per-human',
    windowMs: 60 * 60_000,
    max: SERVER_LIMITS.aiRequestsPerHumanPerHour,
    keyOf: (_req, res) => (typeof res.locals.humanId === 'string' ? res.locals.humanId : undefined),
  });
  const { bodyLimits } = SERVER_LIMITS;

  router.get('/health', healthHandler);

  router.get('/access/status', ipLimit('access-status', 60), accessStatusHandler);
  router.post(
    '/verify-email',
    ipLimit('verify-email', SERVER_LIMITS.verifyEmailPerMinute),
    ...jsonBody(bodyLimits.verifyEmail),
    verifyEmailHandler,
  );
  router.use('/webhook', createWebhookRouter());

  router.get('/challenge', ipLimit('challenge', SERVER_LIMITS.challengeRequestsPerMinute), challengeHandler);
  router.post(
    '/challenge/verify',
    ipLimit('challenge-verify', SERVER_LIMITS.challengeVerificationsPerMinute),
    ...jsonBody(bodyLimits.challenge),
    verifyChallengeHandler,
  );

  router.post(
    '/generate-recipe',
    ipLimit('generate-recipe'),
    requireAccess,
    requireHuman,
    humanLimit,
    ...jsonBody(bodyLimits.generateRecipe),
    generateRecipeHandler,
  );
  router.post(
    '/transcribe',
    ipLimit('transcribe'),
    requireAccess,
    requireHuman,
    humanLimit,
    ...jsonBody(bodyLimits.transcribe),
    transcribeAudioHandler,
  );

  // Cached images are cheap, and the history list may request several at once.
  router.get('/recipe-image', ipLimit('recipe-image', 60), recipeImageHandler);
  router.use(apiNotFound);

  return router;
}
