import type { Request, Response } from 'express';
import { getRecipeImage, parseRecipeImageQuery } from '../services/image.service.ts';

/** `GET /api/recipe-image?prompt&seed&sig` → the cached (or freshly generated) food photo. */
export async function recipeImageHandler(req: Request, res: Response): Promise<void> {
  const request = parseRecipeImageQuery(req.query);
  const image = await getRecipeImage(request);

  // The URL is signed and content-addressed (prompt + seed), so browsers and CDNs may cache it forever.
  // s-maxage lets Vercel's edge cache serve repeat views, since a function's disk cache does not last.
  res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
  res.setHeader('Content-Type', image.contentType);
  res.setHeader('Content-Length', String(image.data.length));
  res.end(image.data);
}
