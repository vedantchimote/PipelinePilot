/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITLAB_API_URL: string;
  readonly VITE_GITLAB_TOKEN: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_AUTO_SAVE_INTERVAL: string;
  readonly VITE_VALIDATION_DEBOUNCE: string;
  readonly VITE_ENABLE_OFFLINE_MODE: string;
  readonly VITE_ENABLE_TEMPLATES: string;
  readonly VITE_ENABLE_VALIDATION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
