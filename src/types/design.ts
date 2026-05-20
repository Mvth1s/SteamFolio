export type ThemeKey = 'pixel' | 'light' | 'horror' | 'space' | 'nature' | 'ocean'
export type LangKey = 'en' | 'fr'
export type TransitionKind = 'pixel' | 'fade' | 'glitch' | 'warp' | 'leaves' | 'tide'
export type ParticleKind = 'pixels' | 'dust' | 'embers' | 'stars' | 'leaves' | 'bubbles'

export interface ThemeColors {
  'bg-deep': string; 'bg-navy': string; 'bg-panel': string; 'bg-panel-2': string
  line: string; 'line-soft': string; accent: string; 'accent-dim': string
  xp: string; 'xp-dim': string; rare: string; 'rare-dim': string
  good: string; bad: string; text: string; 'text-dim': string; 'text-mute': string
}

export interface ThemeFonts { heading: string; body: string; mono: string }
export interface ParticleConfig { kind: ParticleKind; color: string; count: number }

export interface ThemeConfig {
  key: ThemeKey; label: string; emoji: string
  colors: ThemeColors; fonts: ThemeFonts
  cursor: string; particles: ParticleConfig
  bootLines: string[]; pageTransition: TransitionKind; grain: boolean
}

export interface SearchResult {
  kind: 'game' | 'genre' | 'studio'
  name: string; sub: string
  hue?: number; hue2?: number
}
