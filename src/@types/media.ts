/** Binary content serialized for JSON transport (no "data:" prefix). */
export interface MediaAttachment {
  base64: string;
  mimeType: string;
}

/** A compressed photo ready to upload, plus what the UI needs to preview it. */
export interface ImageAttachment extends MediaAttachment {
  /** Data URL used for the local thumbnail. */
  previewUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}

/** A finished voice recording ready to upload. */
export interface AudioRecording extends MediaAttachment {
  durationMs: number;
  sizeBytes: number;
}
