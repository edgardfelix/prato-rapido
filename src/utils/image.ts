import type { ImageAttachment } from '@/@types';
import { LIMITS } from '@/constants/limits';

export type ImageErrorCode = 'invalid-type' | 'too-large' | 'decode-failed';

export class ImageProcessingError extends Error {
  readonly code: ImageErrorCode;

  constructor(code: ImageErrorCode) {
    super(`Image processing failed: ${code}`);
    this.name = 'ImageProcessingError';
    this.code = code;
  }
}

interface CompressOptions {
  maxDimension?: number;
  quality?: number;
}

async function decodeImage(file: File): Promise<{ image: HTMLImageElement; release: () => void }> {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = 'async';
  image.src = url;
  try {
    await image.decode();
  } catch {
    URL.revokeObjectURL(url);
    throw new ImageProcessingError('decode-failed');
  }
  return { image, release: () => URL.revokeObjectURL(url) };
}

/**
 * Downscales and re-encodes a photo as JPEG so uploads stay small (~150-400 KB)
 * on mobile networks. Modern browsers apply EXIF orientation when drawing.
 */
export async function compressImage(file: File, options: CompressOptions = {}): Promise<ImageAttachment> {
  const { maxDimension = LIMITS.imageMaxDimension, quality = LIMITS.imageQuality } = options;

  if (file.type && !file.type.startsWith('image/')) throw new ImageProcessingError('invalid-type');
  if (file.size > LIMITS.imageSourceMaxBytes) throw new ImageProcessingError('too-large');

  const { image, release } = await decodeImage(file);
  try {
    const sourceWidth = image.naturalWidth;
    const sourceHeight = image.naturalHeight;
    if (!sourceWidth || !sourceHeight) throw new ImageProcessingError('decode-failed');

    const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new ImageProcessingError('decode-failed');

    // JPEG has no alpha channel: paint white first so transparent PNGs do not turn black.
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, width, height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);

    return {
      base64,
      mimeType: 'image/jpeg',
      previewUrl: dataUrl,
      width,
      height,
      sizeBytes: Math.floor((base64.length * 3) / 4),
    };
  } finally {
    release();
  }
}
