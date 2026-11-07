/*
 * Tiny Web Audio synthesizer for UI feedback: no audio files to download.
 * Sounds are short and quiet, and on Safari the audio session is "ambient",
 * so they mix with the user's music instead of pausing it and respect the
 * silent switch. Browsers only start audio after a user gesture, so the
 * context is created (or resumed) by `unlockAudio()` on the first tap.
 */

export type SoundName = 'tap' | 'check' | 'uncheck' | 'success' | 'celebrate' | 'water' | 'error';
export type HapticName = 'light' | 'success' | 'celebrate' | 'error';

type AudioContextConstructor = typeof AudioContext;

interface WindowWithWebkitAudio {
  webkitAudioContext?: AudioContextConstructor;
}

interface NavigatorWithAudioSession {
  audioSession?: { type: string };
}

let context: AudioContext | null = null;
let output: GainNode | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Constructor = window.AudioContext ?? (window as unknown as WindowWithWebkitAudio).webkitAudioContext;
  if (!Constructor) return null;

  if (!context) {
    try {
      const session = (navigator as unknown as NavigatorWithAudioSession).audioSession;
      if (session) session.type = 'ambient';
      context = new Constructor({ latencyHint: 'interactive' });
      output = context.createGain();
      output.gain.value = 0.9;
      output.connect(context.destination);
    } catch {
      context = null;
      output = null;
      return null;
    }
  }
  if (context.state === 'suspended') void context.resume().catch(() => undefined);
  return context;
}

/** Call inside a tap/key handler so later sounds (e.g. after an effect) are allowed to play. */
export function unlockAudio(): void {
  getContext();
}

interface ToneOptions {
  type: OscillatorType;
  from: number;
  to?: number;
  at: number;
  duration: number;
  volume: number;
}

function tone(audio: AudioContext, destination: AudioNode, { type, from, to, at, duration, volume }: ToneOptions) {
  const oscillator = audio.createOscillator();
  const envelope = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(from, at);
  if (to) oscillator.frequency.exponentialRampToValueAtTime(to, at + duration);
  // Fast attack + exponential release: soft "pluck" without clicks.
  envelope.gain.setValueAtTime(0.0001, at);
  envelope.gain.exponentialRampToValueAtTime(volume, at + 0.012);
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  oscillator.connect(envelope).connect(destination);
  oscillator.start(at);
  oscillator.stop(at + duration + 0.03);
}

const NOTE = { C5: 523.25, E5: 659.25, G5: 783.99, C6: 1046.5, E6: 1318.51, G6: 1567.98, C7: 2093 };

type Synth = (audio: AudioContext, destination: AudioNode, at: number) => void;

const SOUNDS: Record<SoundName, Synth> = {
  tap: (audio, out, at) => tone(audio, out, { type: 'sine', from: 1100, to: 780, at, duration: 0.05, volume: 0.05 }),
  check: (audio, out, at) => tone(audio, out, { type: 'triangle', from: 660, to: 1320, at, duration: 0.09, volume: 0.09 }),
  uncheck: (audio, out, at) => tone(audio, out, { type: 'sine', from: 520, to: 330, at, duration: 0.08, volume: 0.06 }),
  success: (audio, out, at) => {
    tone(audio, out, { type: 'triangle', from: NOTE.C6, at, duration: 0.12, volume: 0.08 });
    tone(audio, out, { type: 'triangle', from: NOTE.G6, at: at + 0.085, duration: 0.2, volume: 0.08 });
  },
  celebrate: (audio, out, at) => {
    [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6].forEach((frequency, index) => {
      tone(audio, out, { type: 'triangle', from: frequency, at: at + index * 0.075, duration: 0.24, volume: 0.075 });
    });
    tone(audio, out, { type: 'sine', from: NOTE.E6, to: NOTE.C7, at: at + 0.32, duration: 0.4, volume: 0.03 });
  },
  water: (audio, out, at) => tone(audio, out, { type: 'sine', from: 260, to: 720, at, duration: 0.12, volume: 0.09 }),
  error: (audio, out, at) => {
    tone(audio, out, { type: 'triangle', from: 240, to: 200, at, duration: 0.1, volume: 0.06 });
    tone(audio, out, { type: 'triangle', from: 200, to: 160, at: at + 0.12, duration: 0.14, volume: 0.06 });
  },
};

export function playSound(name: SoundName): void {
  const audio = getContext();
  if (!audio || !output) return;
  try {
    SOUNDS[name](audio, output, audio.currentTime + 0.01);
  } catch {
    // Audio is a nice-to-have: never let it break an interaction.
  }
}

const HAPTICS: Record<HapticName, number | number[]> = {
  light: 8,
  success: [10, 40, 14],
  celebrate: [14, 50, 18, 50, 28],
  error: [30, 40, 30],
};

interface NavigatorWithActivation {
  userActivation?: { hasBeenActive: boolean };
}

/**
 * Vibration API (Android browsers); a no-op where unsupported (e.g. iOS
 * Safari). Chrome refuses vibration until the user has interacted with the
 * page, so it is skipped before that instead of logging an intervention.
 */
export function vibrate(name: HapticName): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  const activation = (navigator as unknown as NavigatorWithActivation).userActivation;
  if (activation && !activation.hasBeenActive) return;
  try {
    navigator.vibrate(HAPTICS[name]);
  } catch {
    // Some browsers throw when vibration is blocked by a policy.
  }
}
