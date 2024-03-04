/* eslint-disable no-shadow */
/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_APP_API_URL: string;
  readonly VITE_APP_TITLE_PREFIX: string;
  readonly VITE_APP_TITLE_SUFFIX: string;
  readonly VITE_APP_ROUTER_BASE: string;

  readonly VITE_BACKEND_URL: string;
  readonly VITE_APP_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
