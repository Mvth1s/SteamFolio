/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STEAM_API_KEY: string
  readonly VITE_STEAM_VANITY_URL?: string
  readonly VITE_STEAM_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
