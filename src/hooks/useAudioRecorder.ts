import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { AudioRecording } from '@/@types';
import { LIMITS } from '@/constants/limits';
import { getAudioContextConstructor, prepareAudioForUpload } from '@/utils/audio';

export type RecorderStatus = 'idle' | 'requesting' | 'recording' | 'processing';

export type RecorderErrorCode =
  | 'unsupported'
  | 'insecure-context'
  | 'permission-denied'
  | 'no-microphone'
  | 'too-short'
  | 'failed';

export interface UseAudioRecorderOptions {
  onComplete: (recording: AudioRecording) => void;
  /** Called on every animation frame while recording with the input level (0..1). */
  onLevel?: (level: number) => void;
  maxDurationMs?: number;
  minDurationMs?: number;
}

const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/aac'];

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return undefined;
  }
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type));
}

export function isAudioRecordingSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof MediaRecorder !== 'undefined' &&
    typeof navigator.mediaDevices?.getUserMedia === 'function'
  );
}

function toRecorderError(error: unknown): RecorderErrorCode {
  const name = error instanceof Error ? error.name : '';
  switch (name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
    case 'SecurityError':
      return 'permission-denied';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
    case 'OverconstrainedError':
      return 'no-microphone';
    default:
      return 'failed';
  }
}

/**
 * Voice capture built on MediaRecorder, with a Web Audio API analyser that
 * reports the live input level (used for the pulse animation) and an
 * elapsed-time counter. Recordings are converted to WAV before upload.
 */
export function useAudioRecorder({
  onComplete,
  onLevel,
  maxDurationMs = LIMITS.recordingMaxMs,
  minDurationMs = LIMITS.recordingMinMs,
}: UseAudioRecorderOptions) {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<RecorderErrorCode | null>(null);

  const statusRef = useRef<RecorderStatus>('idle');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const frameRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);
  const limitRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const discardRef = useRef(false);
  const callbacksRef = useRef({ onComplete, onLevel });

  useLayoutEffect(() => {
    callbacksRef.current = { onComplete, onLevel };
  });

  const updateStatus = useCallback((next: RecorderStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const releaseResources = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    if (tickRef.current !== null) window.clearInterval(tickRef.current);
    if (limitRef.current !== null) window.clearTimeout(limitRef.current);
    frameRef.current = null;
    tickRef.current = null;
    limitRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    const context = audioContextRef.current;
    audioContextRef.current = null;
    if (context && context.state !== 'closed') void context.close().catch(() => undefined);

    callbacksRef.current.onLevel?.(0);
  }, []);

  /**
   * Created synchronously inside the tap handler: Safari (and Chrome's autoplay
   * policy) only let an AudioContext run when it starts from a user gesture.
   */
  const createAudioContext = useCallback(() => {
    const AudioContextConstructor = getAudioContextConstructor();
    if (!AudioContextConstructor) return;
    try {
      const context = new AudioContextConstructor();
      audioContextRef.current = context;
      void context.resume().catch(() => undefined);
    } catch {
      audioContextRef.current = null;
    }
  }, []);

  const startLevelMeter = useCallback((stream: MediaStream) => {
    const context = audioContextRef.current;
    if (!context) return;
    try {
      if (context.state === 'suspended') void context.resume().catch(() => undefined);
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.6;
      context.createMediaStreamSource(stream).connect(analyser);

      const samples = new Uint8Array(analyser.fftSize);
      let smoothed = 0;
      const measure = () => {
        analyser.getByteTimeDomainData(samples);
        let sumOfSquares = 0;
        for (let index = 0; index < samples.length; index += 1) {
          const normalized = ((samples[index] ?? 128) - 128) / 128;
          sumOfSquares += normalized * normalized;
        }
        const rms = Math.sqrt(sumOfSquares / samples.length);
        smoothed = smoothed * 0.7 + Math.min(1, rms * 4) * 0.3;
        callbacksRef.current.onLevel?.(smoothed);
        frameRef.current = requestAnimationFrame(measure);
      };
      frameRef.current = requestAnimationFrame(measure);
    } catch {
      // The meter is purely visual; recording keeps working without it.
    }
  }, []);

  const finishRecording = useCallback(
    async (mimeType: string) => {
      const durationMs = performance.now() - startedAtRef.current;
      const chunks = chunksRef.current;
      chunksRef.current = [];
      recorderRef.current = null;
      releaseResources();
      setElapsedMs(0);

      if (discardRef.current) {
        discardRef.current = false;
        updateStatus('idle');
        return;
      }
      if (durationMs < minDurationMs || chunks.length === 0) {
        setError('too-short');
        updateStatus('idle');
        return;
      }

      updateStatus('processing');
      try {
        const recording = await prepareAudioForUpload(new Blob(chunks, { type: mimeType }), durationMs);
        callbacksRef.current.onComplete(recording);
      } catch {
        setError('failed');
      } finally {
        updateStatus('idle');
      }
    },
    [minDurationMs, releaseResources, updateStatus],
  );

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
  }, []);

  /** Stops and throws the recording away. */
  const cancel = useCallback(() => {
    discardRef.current = true;
    stop();
  }, [stop]);

  const start = useCallback(async () => {
    if (statusRef.current !== 'idle') return;
    setError(null);

    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setError('insecure-context');
      return;
    }
    if (!isAudioRecordingSupported()) {
      setError('unsupported');
      return;
    }

    discardRef.current = false;
    createAudioContext();
    updateStatus('requesting');

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch (mediaError) {
      releaseResources();
      updateStatus('idle');
      setError(toRecorderError(mediaError));
      return;
    }

    // Cancelled (or unmounted) while the permission prompt was open.
    if (discardRef.current) {
      stream.getTracks().forEach((track) => track.stop());
      releaseResources();
      discardRef.current = false;
      updateStatus('idle');
      return;
    }

    const preferredType = pickMimeType();
    let recorder: MediaRecorder;
    try {
      recorder = preferredType ? new MediaRecorder(stream, { mimeType: preferredType }) : new MediaRecorder(stream);
    } catch {
      stream.getTracks().forEach((track) => track.stop());
      releaseResources();
      updateStatus('idle');
      setError('unsupported');
      return;
    }

    streamRef.current = stream;
    recorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      void finishRecording(recorder.mimeType || preferredType || 'audio/webm');
    };
    recorder.onerror = () => {
      discardRef.current = true;
      setError('failed');
      if (recorder.state !== 'inactive') recorder.stop();
    };

    recorder.start(1000);
    startedAtRef.current = performance.now();
    setElapsedMs(0);
    updateStatus('recording');

    tickRef.current = window.setInterval(() => {
      setElapsedMs(performance.now() - startedAtRef.current);
    }, 250);
    limitRef.current = window.setTimeout(stop, maxDurationMs);
    startLevelMeter(stream);
  }, [createAudioContext, finishRecording, maxDurationMs, releaseResources, startLevelMeter, stop, updateStatus]);

  const clearError = useCallback(() => setError(null), []);

  // Release the microphone if the component unmounts mid-recording.
  useEffect(
    () => () => {
      discardRef.current = true;
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== 'inactive') recorder.stop();
      releaseResources();
    },
    [releaseResources],
  );

  return {
    status,
    error,
    elapsedMs,
    maxDurationMs,
    isRecording: status === 'recording',
    isBusy: status !== 'idle',
    start,
    stop,
    cancel,
    clearError,
  };
}
