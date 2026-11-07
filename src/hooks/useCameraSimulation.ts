import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ChangeEvent } from 'react';
import type { ImageAttachment } from '@/@types';
import { compressImage, ImageProcessingError, type ImageErrorCode } from '@/utils/image';

export interface UseCameraSimulationOptions {
  onCapture: (image: ImageAttachment) => void;
  /** How long the simulated "AI scan" overlay runs after a capture. */
  scanDurationMs?: number;
}

/**
 * Camera and gallery capture through native file inputs (the most reliable
 * path on mobile: it opens the system camera with focus, flash and HDR).
 * The photo is compressed on-device and followed by a short simulated
 * "vision scan" animation while the thumbnail appears.
 */
export function useCameraSimulation({ onCapture, scanDurationMs = 1600 }: UseCameraSimulationOptions) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const scanTimerRef = useRef<number | null>(null);
  const onCaptureRef = useRef(onCapture);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<ImageErrorCode | null>(null);

  useLayoutEffect(() => {
    onCaptureRef.current = onCapture;
  });

  useEffect(
    () => () => {
      if (scanTimerRef.current !== null) window.clearTimeout(scanTimerRef.current);
    },
    [],
  );

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.currentTarget;
      const file = input.files?.[0];
      input.value = ''; // lets the user pick the same photo again
      if (!file) return;

      setError(null);
      setIsProcessing(true);
      try {
        const image = await compressImage(file);
        onCaptureRef.current(image);
        setIsScanning(true);
        if (scanTimerRef.current !== null) window.clearTimeout(scanTimerRef.current);
        scanTimerRef.current = window.setTimeout(() => setIsScanning(false), scanDurationMs);
      } catch (captureError) {
        setError(captureError instanceof ImageProcessingError ? captureError.code : 'decode-failed');
      } finally {
        setIsProcessing(false);
      }
    },
    [scanDurationMs],
  );

  const openCamera = useCallback(() => cameraInputRef.current?.click(), []);
  const openGallery = useCallback(() => galleryInputRef.current?.click(), []);
  const clearError = useCallback(() => setError(null), []);

  const cameraInputProps = {
    ref: cameraInputRef,
    type: 'file',
    accept: 'image/*',
    capture: 'environment',
    tabIndex: -1,
    'aria-hidden': true,
    onChange: handleFileChange,
  } as const;

  const galleryInputProps = {
    ref: galleryInputRef,
    type: 'file',
    accept: 'image/*',
    tabIndex: -1,
    'aria-hidden': true,
    onChange: handleFileChange,
  } as const;

  return {
    openCamera,
    openGallery,
    cameraInputProps,
    galleryInputProps,
    isProcessing,
    isScanning,
    error,
    clearError,
  };
}
