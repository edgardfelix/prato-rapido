import type { Request, Response } from 'express';
import { createChallenge, verifyChallenge } from '../services/challenge.service.ts';
import { validateChallengeAnswer } from '../validation/payload.validator.ts';

export function challengeHandler(_req: Request, res: Response): void {
  res.status(200).json(createChallenge());
}

export function verifyChallengeHandler(req: Request, res: Response): void {
  res.status(200).json(verifyChallenge(validateChallengeAnswer(req.body)));
}
