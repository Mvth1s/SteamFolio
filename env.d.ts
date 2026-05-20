/// <reference types="vite/client" />

declare const __APP_VERSION__: string

interface ImportMetaEnv {
  readonly VITE_STEAM_API_KEY: string
  readonly VITE_STEAM_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
