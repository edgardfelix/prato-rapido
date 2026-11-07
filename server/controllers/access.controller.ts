import type { Request, Response } from 'express';
import type { AccessStatusResponse, VerifyEmailResponse } from '../../src/@types/access.ts';
import { env } from '../config/env.ts';
import { issueAccessToken } from '../services/access.service.ts';
import { isEmailAuthorized } from '../services/buyers.service.ts';
import { UpstashError } from '../services/upstash.service.ts';
import { HttpError } from '../utils/httpError.ts';
import { maskEmail } from '../validation/email.ts';
import { validateVerifyEmailPayload } from '../validation/payload.validator.ts';

export const BUYER_NOT_FOUND_MESSAGE = 'E-mail não encontrado na base de compradores.';

/** `GET /api/access/status`: tells the app whether to show the activation screen. */
export function accessStatusHandler(_req: Request, res: Response): void {
  const { enabled, checkoutUrl, priceLabel } = env.paywall;
  const body: AccessStatusResponse = { enabled, checkoutUrl, priceLabel };
  res.status(200).json(body);
}

/** `POST /api/verify-email`: a buyer's e-mail is exchanged for a signed access token. */
export async function verifyEmailHandler(req: Request, res: Response): Promise<void> {
  if (!env.paywall.enabled) throw new HttpError(503, 'NOT_CONFIGURED', 'O acesso pago não está ativo neste servidor.');
  const { email } = validateVerifyEmailPayload(req.body);

  let authorized: boolean;
  try {
    authorized = await isEmailAuthorized(email);
  } catch (error) {
    if (!(error instanceof UpstashError)) throw error;
    throw new HttpError(503, 'ACCESS_UNAVAILABLE', 'Não foi possível conferir sua compra agora. Tente de novo em instantes.', {
      cause: error,
    });
  }

  if (!authorized) {
    const body: VerifyEmailResponse = { success: false, message: BUYER_NOT_FOUND_MESSAGE };
    res.status(200).json(body);
    return;
  }

  const { token, expiresAt } = issueAccessToken(email);
  console.log(`[paywall] Access activated for ${maskEmail(email)}.`);
  const body: VerifyEmailResponse = { success: true, accessToken: token, expiresAt };
  res.status(200).json(body);
}
