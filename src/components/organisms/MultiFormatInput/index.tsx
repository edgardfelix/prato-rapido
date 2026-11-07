import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { Camera, Images, Mic, Sparkles, Square, Trash2, X } from 'lucide-react';
import type { AudioRecording, RecipeMode } from '@/@types';
import { Button } from '@/components/atoms/Button';
import { IconButton } from '@/components/atoms/IconButton';
import { Spinner } from '@/components/atoms/Spinner';
import { InlineAlert } from '@/components/molecules/InlineAlert';
import { Modal } from '@/components/organisms/Modal';
import { LIMITS } from '@/constants/limits';
import { INPUT_PLACEHOLDERS, MODE_LABELS } from '@/constants/recipe';
import type { InputDraft } from '@/context/RecipeContext';
import { useAudioRecorder, type RecorderErrorCode } from '@/hooks/useAudioRecorder';
import { useAutoResizeTextarea } from '@/hooks/useAutoResizeTextarea';
import { useCameraSimulation } from '@/hooks/useCameraSimulation';
import { getErrorMessage } from '@/services/httpClient';
import { appendText, formatDuration } from '@/utils/format';
import type { ImageErrorCode } from '@/utils/image';
import * as S from './styles';

const RECORDER_ERRORS: Record<RecorderErrorCode, string> = {
  unsupported: 'Seu navegador não grava áudio. Digite os ingredientes ou envie uma foto.',
  'insecure-context': 'O microfone só funciona em conexão segura (HTTPS ou localhost).',
  'permission-denied': 'Permita o acesso ao microfone nas configurações do navegador e tente de novo.',
  'no-microphone': 'Nenhum microfone foi encontrado neste aparelho.',
  'too-short': 'A gravação ficou curta demais. Fale por pelo menos 1 segundo.',
  failed: 'Não foi possível gravar o áudio. Tente novamente.',
};

const IMAGE_ERRORS: Record<ImageErrorCode, string> = {
  'invalid-type': 'Esse arquivo não é uma imagem. Escolha uma foto JPG, PNG ou WebP.',
  'too-large': 'A foto é grande demais (máximo de 15 MB).',
  'decode-failed': 'Não consegui abrir essa foto. Tente outra imagem em JPG ou PNG.',
};

/** Per-bar gains for the live level meter (a single CSS variable drives all bars). */
const METER_GAINS = [0.55, 0.9, 1.3, 0.9, 0.55];

type Notice = { tone: 'error' | 'success'; message: string } | null;

export interface MultiFormatInputProps {
  value: InputDraft;
  onChange: (draft: InputDraft) => void;
  onSubmit: () => void;
  /** Injected so the component stays independent from the service layer. */
  onTranscribeAudio: (recording: AudioRecording, signal: AbortSignal) => Promise<string>;
  mode: RecipeMode;
  onClearMode: () => void;
  isSubmitting?: boolean;
}

/**
 * Text + camera/gallery photo + voice dictation in a single composer.
 * Voice notes are recorded with MediaRecorder, transcribed by the API and
 * appended to the text so the user can review them before generating.
 */
export function MultiFormatInput({
  value,
  onChange,
  onSubmit,
  onTranscribeAudio,
  mode,
  onClearMode,
  isSubmitting = false,
}: MultiFormatInputProps) {
  const textareaId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const meterRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);
  const transcribeAbortRef = useRef<AbortController | null>(null);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  useLayoutEffect(() => {
    valueRef.current = value;
  });
  useAutoResizeTextarea(textareaRef, value.text);
  useEffect(() => () => transcribeAbortRef.current?.abort(), []);

  useEffect(() => {
    if (notice?.tone !== 'success') return;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const handleRecordingComplete = useCallback(
    async (recording: AudioRecording) => {
      transcribeAbortRef.current?.abort();
      const controller = new AbortController();
      transcribeAbortRef.current = controller;
      setIsTranscribing(true);
      setNotice(null);

      try {
        const transcript = (await onTranscribeAudio(recording, controller.signal)).trim();
        if (controller.signal.aborted) return;
        if (!transcript) {
          setNotice({
            tone: 'error',
            message: 'Não consegui entender o áudio. Fale mais perto do microfone e tente de novo.',
          });
          return;
        }
        const current = valueRef.current;
        onChange({ ...current, text: appendText(current.text, transcript).slice(0, LIMITS.ingredientsMaxChars) });
        setNotice({ tone: 'success', message: 'Áudio transcrito e adicionado aos ingredientes.' });
      } catch (error) {
        if (!controller.signal.aborted) setNotice({ tone: 'error', message: getErrorMessage(error) });
      } finally {
        if (transcribeAbortRef.current === controller) {
          transcribeAbortRef.current = null;
          setIsTranscribing(false);
        }
      }
    },
    [onChange, onTranscribeAudio],
  );

  const recorder = useAudioRecorder({
    onComplete: handleRecordingComplete,
    // Written straight to the DOM: no React re-render per animation frame.
    onLevel: (level) => meterRef.current?.style.setProperty('--level', level.toFixed(3)),
  });

  const camera = useCameraSimulation({
    onCapture: (image) => {
      onChange({ ...valueRef.current, image });
      setNotice(null);
    },
  });

  const isBusy = recorder.isBusy || isTranscribing || camera.isProcessing;
  const hasIngredients = value.text.trim().length >= LIMITS.ingredientsMinChars || value.image !== null;
  const canSubmit = !isSubmitting && !isBusy && (hasIngredients || mode === 'budget');
  const showCounter = value.text.length > LIMITS.ingredientsMaxChars * 0.8;

  const errorMessage =
    (recorder.error && RECORDER_ERRORS[recorder.error]) ||
    (camera.error && IMAGE_ERRORS[camera.error]) ||
    (notice?.tone === 'error' ? notice.message : null);

  const dismissError = () => {
    recorder.clearError();
    camera.clearError();
    setNotice(null);
  };

  const handleMicClick = () => {
    camera.clearError();
    setNotice(null);
    void recorder.start();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && canSubmit) {
      event.preventDefault();
      onSubmit();
    }
  };

  const pickFromCamera = () => {
    camera.openCamera(); // must run inside the tap gesture
    setIsSheetOpen(false);
  };

  const pickFromGallery = () => {
    camera.openGallery();
    setIsSheetOpen(false);
  };

  const showTranscribing = isTranscribing || recorder.status === 'processing';
  const showAttachments = Boolean(value.image) || camera.isProcessing || showTranscribing;

  return (
    <S.Card $isRecording={recorder.isRecording}>
      <S.LabelRow>
        <S.Label htmlFor={textareaId}>Seus ingredientes</S.Label>
        {mode !== 'standard' && (
          <S.ModeChip>
            {MODE_LABELS[mode]}
            <S.ModeChipClear type="button" aria-label={`Remover modo ${MODE_LABELS[mode]}`} onClick={onClearMode}>
              <X size={14} strokeWidth={2.5} />
            </S.ModeChipClear>
          </S.ModeChip>
        )}
      </S.LabelRow>

      <S.TextArea
        id={textareaId}
        ref={textareaRef}
        rows={3}
        value={value.text}
        onChange={(event) => onChange({ ...value, text: event.target.value })}
        onKeyDown={handleKeyDown}
        placeholder={INPUT_PLACEHOLDERS[mode]}
        maxLength={LIMITS.ingredientsMaxChars}
        autoComplete="off"
        spellCheck
      />
      {showCounter && (
        <S.Counter aria-live="polite">
          {value.text.length}/{LIMITS.ingredientsMaxChars}
        </S.Counter>
      )}

      {showAttachments && (
        <S.Attachments>
          {camera.isProcessing && (
            <S.StatusChip role="status">
              <Spinner size={16} /> Preparando a foto…
            </S.StatusChip>
          )}
          {value.image && (
            <S.ImageChip>
              <S.Thumb>
                <img src={value.image.previewUrl} alt="Foto dos ingredientes anexada" />
                {camera.isScanning && <S.ScanOverlay aria-hidden="true" />}
              </S.Thumb>
              <S.ChipText>
                <strong>{camera.isScanning ? 'Analisando a foto…' : 'Foto anexada'}</strong>
                <span>A IA vai identificar os ingredientes</span>
              </S.ChipText>
              <IconButton size="sm" variant="ghost" label="Remover foto" onClick={() => onChange({ ...value, image: null })}>
                <X size={16} />
              </IconButton>
            </S.ImageChip>
          )}
          {showTranscribing && (
            <S.StatusChip role="status">
              <Spinner size={16} /> Transcrevendo o áudio…
            </S.StatusChip>
          )}
        </S.Attachments>
      )}

      <S.Toolbar>
        {recorder.isRecording ? (
          <S.RecordingBar ref={meterRef}>
            <IconButton variant="ghost" label="Descartar gravação" onClick={recorder.cancel}>
              <Trash2 size={20} />
            </IconButton>
            <S.RecordingInfo>
              <S.RecDot aria-hidden="true" />
              <S.Timer>{formatDuration(recorder.elapsedMs)}</S.Timer>
              <S.TimerLimit>/ {formatDuration(recorder.maxDurationMs)}</S.TimerLimit>
              <S.LevelBars aria-hidden="true">
                {METER_GAINS.map((gain, index) => (
                  <span key={index} style={{ '--gain': gain } as CSSProperties} />
                ))}
              </S.LevelBars>
            </S.RecordingInfo>
            <S.StopButton type="button" aria-label="Parar gravação e transcrever" onClick={recorder.stop}>
              <S.PulseRing aria-hidden="true" />
              <Square size={16} fill="currentColor" />
            </S.StopButton>
          </S.RecordingBar>
        ) : (
          <>
            <S.Tools>
              <IconButton label="Adicionar foto dos ingredientes" onClick={() => setIsSheetOpen(true)} disabled={isBusy}>
                <Camera size={20} />
              </IconButton>
              <IconButton label="Ditar ingredientes por voz" onClick={handleMicClick} disabled={isBusy}>
                {recorder.status === 'requesting' ? <Spinner size={18} /> : <Mic size={20} />}
              </IconButton>
            </S.Tools>
            <Button
              leftIcon={<Sparkles size={18} />}
              onClick={onSubmit}
              disabled={!canSubmit}
              isLoading={isSubmitting}
            >
              Gerar receita
            </Button>
          </>
        )}
      </S.Toolbar>

      <S.LiveRegion aria-live="polite">
        {recorder.isRecording ? 'Gravando. Toque em parar quando terminar de falar.' : ''}
      </S.LiveRegion>

      {errorMessage && (
        <InlineAlert tone="error" onDismiss={dismissError}>
          {errorMessage}
        </InlineAlert>
      )}
      {notice?.tone === 'success' && <InlineAlert tone="success">{notice.message}</InlineAlert>}

      <S.HiddenFileInput {...camera.cameraInputProps} />
      <S.HiddenFileInput {...camera.galleryInputProps} />

      <Modal
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="Adicionar foto"
        description="Fotografe a geladeira, a bancada ou a despensa. A IA identifica os ingredientes visíveis."
      >
        <S.SheetOptions>
          <S.SheetOption type="button" onClick={pickFromCamera}>
            <S.SheetIcon aria-hidden="true">
              <Camera size={22} />
            </S.SheetIcon>
            <S.SheetText>
              <strong>Tirar foto agora</strong>
              <span>Abre a câmera do aparelho</span>
            </S.SheetText>
          </S.SheetOption>
          <S.SheetOption type="button" onClick={pickFromGallery}>
            <S.SheetIcon aria-hidden="true">
              <Images size={22} />
            </S.SheetIcon>
            <S.SheetText>
              <strong>Escolher da galeria</strong>
              <span>Use uma foto que já está no aparelho</span>
            </S.SheetText>
          </S.SheetOption>
        </S.SheetOptions>
      </Modal>
    </S.Card>
  );
}
