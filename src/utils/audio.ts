import type { AudioRecording } from '@/@types';

const TARGET_SAMPLE_RATE = 16_000;

type LegacyAudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
  webkitOfflineAudioContext?: typeof OfflineAudioContext;
};

export function getAudioContextConstructor(): typeof AudioContext | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.AudioContext ?? (window as LegacyAudioWindow).webkitAudioContext;
}

function getOfflineAudioContextConstructor(): typeof OfflineAudioContext | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.OfflineAudioContext ?? (window as LegacyAudioWindow).webkitOfflineAudioContext;
}

/** "audio/webm;codecs=opus" -> "audio/webm"; Safari's "audio/mp4" -> "audio/m4a". */
export function normalizeAudioMimeType(type: string): string {
  const base = type.split(';')[0]?.trim().toLowerCase() ?? '';
  if (base === 'audio/mp4' || base === 'audio/x-m4a') return 'audio/m4a';
  return base || 'audio/webm';
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read audio'));
    reader.readAsDataURL(blob);
  });
}

/** Encodes mono float samples as a 16-bit PCM WAV file. */
function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const bytesPerSample = 2;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeAscii = (offset: number, text: string) => {
    for (let index = 0; index < text.length; index += 1) {
      view.setUint8(offset + index, text.charCodeAt(index));
    }
  };

  writeAscii(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(8, 'WAVE');
  writeAscii(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true); // byte rate
  view.setUint16(32, bytesPerSample, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeAscii(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index] ?? 0));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += bytesPerSample;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Decodes the MediaRecorder output (webm/opus, mp4/aac, ogg...) and re-encodes
 * it as 16 kHz mono WAV, a format every Gemini model accepts.
 */
async function convertToWav(blob: Blob): Promise<Blob> {
  const OfflineContext = getOfflineAudioContextConstructor();
  if (!OfflineContext) throw new Error('OfflineAudioContext is not available');

  const encoded = await blob.arrayBuffer();
  // decodeAudioData resamples to the context sample rate.
  const decoded = await new OfflineContext(1, 1, TARGET_SAMPLE_RATE).decodeAudioData(encoded);

  const frameCount = Math.max(1, Math.ceil(decoded.duration * TARGET_SAMPLE_RATE));
  const renderer = new OfflineContext(1, frameCount, TARGET_SAMPLE_RATE);
  const source = renderer.createBufferSource();
  source.buffer = decoded;
  source.connect(renderer.destination); // down-mixes to mono
  source.start(0);
  const rendered = await renderer.startRendering();

  return encodeWav(rendered.getChannelData(0), TARGET_SAMPLE_RATE);
}

/** Converts a recording to an upload-ready attachment, falling back to the original container. */
export async function prepareAudioForUpload(blob: Blob, durationMs: number): Promise<AudioRecording> {
  try {
    const wav = await convertToWav(blob);
    return { base64: await blobToBase64(wav), mimeType: 'audio/wav', durationMs, sizeBytes: wav.size };
  } catch {
    return {
      base64: await blobToBase64(blob),
      mimeType: normalizeAudioMimeType(blob.type),
      durationMs,
      sizeBytes: blob.size,
    };
  }
}
