interface ImportMetaEnv {
  /** Optional absolute API origin when the web app is hosted apart from the API. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
