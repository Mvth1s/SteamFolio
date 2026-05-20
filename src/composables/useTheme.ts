import { ref, readonly } from 'vue'
import type { ThemeKey, ThemeConfig } from '@/types/design'

function svgCursor(svg: string, hotX = 4, hotY = 4): string {
  const encoded = encodeURIComponent(svg.replace(/\s+/g, ' '))
  return `url("data:image/svg+xml;utf8,${encoded}") ${hotX} ${hotY}, auto`
}

export const SF_CURSORS: Record<string, string> = {
  pixel: svgCursor(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12" shape-rendering="crispEdges">
      <rect x="1" y="4" width="10" height="4" fill="#66c0f4"/>
      <rect x="0" y="5" width="12" height="2" fill="#66c0f4"/>
      <rect x="1" y="3" width="2" height="1" fill="#1b2838"/>
      <rect x="9" y="3" width="2" height="1" fill="#1b2838"/>
      <rect x="2" y="5" width="1" height="2" fill="#fff"/>
      <rect x="9" y="5" width="1" height="2" fill="#fff"/>
      <rect x="3" y="6" width="1" height="1" fill="#fff"/>
      <rect x="2" y="5" width="1" height="2" fill="#1b2838"/>
    </svg>`, 6, 6),

  arrow: svgCursor(`
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
      <filter id="s"><feDropShadow dx="0" dy="1" stdDeviation="0.7" flood-opacity="0.3"/></filter>
      <path d="M3 2 L3 15 L7 11 L9 16 L11 15 L9 10 L14 10 Z" fill="#0a6bd1" stroke="#fff" stroke-width="1" filter="url(#s)"/>
    </svg>`, 2, 2),

  blood: svgCursor(`
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="24" viewBox="0 0 20 24">
      <path d="M10 1 C 6 8 3 12 3 16 a 7 7 0 0 0 14 0 c 0-4-3-8-7-15 Z"
            fill="#c81d25" stroke="#3a0808" stroke-width="1"/>
      <ellipse cx="7.5" cy="14" rx="2" ry="3" fill="#ff6b6b" opacity="0.7"/>
    </svg>`, 10, 4),

  crosshair: svgCursor(`
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="10" fill="none" stroke="#7df9ff" stroke-width="1.5"/>
      <circle cx="14" cy="14" r="2" fill="#7df9ff"/>
      <line x1="14" y1="2" x2="14" y2="8" stroke="#7df9ff" stroke-width="1.5"/>
      <line x1="14" y1="20" x2="14" y2="26" stroke="#7df9ff" stroke-width="1.5"/>
      <line x1="2" y1="14" x2="8" y2="14" stroke="#7df9ff" stroke-width="1.5"/>
      <line x1="20" y1="14" x2="26" y2="14" stroke="#7df9ff" stroke-width="1.5"/>
    </svg>`, 14, 14),

  leaf: svgCursor(`
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
      <path d="M3 19 C 4 12 9 4 19 3 C 18 12 12 18 5 19 Z" fill="#7fb350" stroke="#3a5520" stroke-width="1"/>
      <path d="M5 19 C 8 14 12 9 18 5" stroke="#3a5520" stroke-width="1" fill="none"/>
    </svg>`, 4, 18),

  drop: svgCursor(`
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="24" viewBox="0 0 20 24">
      <path d="M10 1 C 6 8 3 12 3 16 a 7 7 0 0 0 14 0 c 0-4-3-8-7-15 Z"
            fill="#5fd7e6" stroke="#073a55" stroke-width="1"/>
      <ellipse cx="7.5" cy="14" rx="2" ry="3" fill="#a8edf5" opacity="0.7"/>
    </svg>`, 10, 4),
}

export const SF_THEMES: Record<ThemeKey, ThemeConfig> = {
  pixel: {
    key: 'pixel',
    label: 'Pixel Art',
    emoji: '🎮',
    colors: {
      'bg-deep':   '#0e1820',
      'bg-navy':   '#1b2838',
      'bg-panel':  '#2a475e',
      'bg-panel-2':'#213a4f',
      'line':      '#34536e',
      'line-soft': '#2e4a64',
      'accent':    '#66c0f4',
      'accent-dim':'#4a93c1',
      'xp':        '#f3a847',
      'xp-dim':    '#a26d27',
      'rare':      '#b389ff',
      'rare-dim':  '#6d4cb5',
      'good':      '#5ee37d',
      'bad':       '#ff6b6b',
      'text':      '#e7eef5',
      'text-dim':  '#9bb3c7',
      'text-mute': '#6c8499',
    },
    fonts: {
      heading: '"Press Start 2P", ui-monospace, monospace',
      body:    '"Inter", system-ui, sans-serif',
      mono:    '"JetBrains Mono", ui-monospace, monospace',
    },
    cursor: 'pixel',
    particles: { kind: 'pixels', color: '#66c0f4', count: 60 },
    bootLines: [
      '> SteamFolio v0.4 boot…',
      '> Initializing pixel ROM…',
      '> Fetching player profile [Mvtos]…',
      '> Mounting library: 412 entries…',
      '> Verifying achievements: 2841 trophies…',
      '> Player ready. PRESS START.',
    ],
    pageTransition: 'pixel',
    grain: true,
  },

  light: {
    key: 'light',
    label: 'Light',
    emoji: '☀️',
    colors: {
      'bg-deep':   '#f3f5f8',
      'bg-navy':   '#ffffff',
      'bg-panel':  '#eef2f6',
      'bg-panel-2':'#f8fafc',
      'line':      '#cdd6e0',
      'line-soft': '#dde4ec',
      'accent':    '#0a6bd1',
      'accent-dim':'#7aa9d6',
      'xp':        '#d97706',
      'xp-dim':    '#a8590a',
      'rare':      '#8b5cf6',
      'rare-dim':  '#5f3fb0',
      'good':      '#10a35a',
      'bad':       '#dc2626',
      'text':      '#0e1820',
      'text-dim':  '#475569',
      'text-mute': '#94a3b8',
    },
    fonts: {
      heading: '"Nunito", system-ui, sans-serif',
      body:    '"Inter", system-ui, sans-serif',
      mono:    '"JetBrains Mono", ui-monospace, monospace',
    },
    cursor: 'arrow',
    particles: { kind: 'dust', color: '#0a6bd1', count: 28 },
    bootLines: [
      'Welcome to SteamFolio',
      'Loading your profile…',
      'Syncing library…',
      'Computing statistics…',
      'Ready.',
    ],
    pageTransition: 'fade',
    grain: false,
  },

  horror: {
    key: 'horror',
    label: 'Horror',
    emoji: '🩸',
    colors: {
      'bg-deep':   '#080606',
      'bg-navy':   '#100c0c',
      'bg-panel':  '#1a1212',
      'bg-panel-2':'#221717',
      'line':      '#3b1f1f',
      'line-soft': '#2a1717',
      'accent':    '#c81d25',
      'accent-dim':'#7a1217',
      'xp':        '#b87333',
      'xp-dim':    '#6a3e15',
      'rare':      '#7a0f4a',
      'rare-dim':  '#3b0823',
      'good':      '#8a9b3a',
      'bad':       '#c81d25',
      'text':      '#e8dcdc',
      'text-dim':  '#a08a8a',
      'text-mute': '#665555',
    },
    fonts: {
      heading: '"UnifrakturMaguntia", "Creepster", serif',
      body:    '"Courier Prime", "Courier New", monospace',
      mono:    '"JetBrains Mono", ui-monospace, monospace',
    },
    cursor: 'blood',
    particles: { kind: 'embers', color: '#c81d25', count: 40 },
    bootLines: [
      'somewhere, a profile awakens…',
      'opening the grimoire of games…',
      'counting the souls (412)…',
      'whispering achievements (2841)…',
      'a door creaks open. enter.',
    ],
    pageTransition: 'glitch',
    grain: true,
  },

  space: {
    key: 'space',
    label: 'Space',
    emoji: '🚀',
    colors: {
      'bg-deep':   '#050218',
      'bg-navy':   '#0a0530',
      'bg-panel':  '#120a4a',
      'bg-panel-2':'#0e0838',
      'line':      '#2b1e80',
      'line-soft': '#1d1565',
      'accent':    '#7df9ff',
      'accent-dim':'#3aaab0',
      'xp':        '#ffb547',
      'xp-dim':    '#a8702a',
      'rare':      '#ff5edd',
      'rare-dim':  '#a13c8e',
      'good':      '#5eff9a',
      'bad':       '#ff5e7a',
      'text':      '#e8e6ff',
      'text-dim':  '#9d96d6',
      'text-mute': '#6358a6',
    },
    fonts: {
      heading: '"Orbitron", "Exo 2", sans-serif',
      body:    '"Exo 2", system-ui, sans-serif',
      mono:    '"JetBrains Mono", ui-monospace, monospace',
    },
    cursor: 'crosshair',
    particles: { kind: 'stars', color: '#7df9ff', count: 120 },
    bootLines: [
      '[SYS] Initializing Steam.OS subspace link…',
      '[NET] Pinging satellite Mvtos…',
      '[DAT] Telemetry stream open · 412 games found',
      '[ACH] Decoding trophy signal · 2841 unlocked',
      '[OK]  Bridge online. Engage.',
    ],
    pageTransition: 'warp',
    grain: false,
  },

  nature: {
    key: 'nature',
    label: 'Nature',
    emoji: '🌿',
    colors: {
      'bg-deep':   '#1a1a14',
      'bg-navy':   '#23241c',
      'bg-panel':  '#2d3027',
      'bg-panel-2':'#262920',
      'line':      '#4a523a',
      'line-soft': '#3a4030',
      'accent':    '#7fb350',
      'accent-dim':'#4d7530',
      'xp':        '#d4a04a',
      'xp-dim':    '#7e6020',
      'rare':      '#b96fd6',
      'rare-dim':  '#6f3e8c',
      'good':      '#7fb350',
      'bad':       '#c4684a',
      'text':      '#eee5d2',
      'text-dim':  '#b5ad94',
      'text-mute': '#7d775f',
    },
    fonts: {
      heading: '"Playfair Display", Georgia, serif',
      body:    '"Lato", system-ui, sans-serif',
      mono:    '"JetBrains Mono", ui-monospace, monospace',
    },
    cursor: 'leaf',
    particles: { kind: 'leaves', color: '#7fb350', count: 30 },
    bootLines: [
      'A leaf unfurls. Welcome.',
      'Gathering your collection of 412 worlds…',
      'Counting moments — 3,127 hours and growing.',
      'The garden of trophies has 2,841 bloomed.',
      'Step softly into the grove.',
    ],
    pageTransition: 'leaves',
    grain: false,
  },

  ocean: {
    key: 'ocean',
    label: 'Ocean',
    emoji: '🌊',
    colors: {
      'bg-deep':   '#031d2e',
      'bg-navy':   '#06304a',
      'bg-panel':  '#0a4566',
      'bg-panel-2':'#073a55',
      'line':      '#196a90',
      'line-soft': '#0e5478',
      'accent':    '#5fd7e6',
      'accent-dim':'#2c8fa0',
      'xp':        '#ffd166',
      'xp-dim':    '#a07d2a',
      'rare':      '#a586ff',
      'rare-dim':  '#5d3fb6',
      'good':      '#3fe0a0',
      'bad':       '#ff7a8a',
      'text':      '#e0f3f9',
      'text-dim':  '#9ec5d5',
      'text-mute': '#5b8da0',
    },
    fonts: {
      heading: '"Raleway", system-ui, sans-serif',
      body:    '"Source Sans 3", "Source Sans Pro", system-ui, sans-serif',
      mono:    '"JetBrains Mono", ui-monospace, monospace',
    },
    cursor: 'drop',
    particles: { kind: 'bubbles', color: '#5fd7e6', count: 40 },
    bootLines: [
      'Diving in…',
      'Surfacing your library — 412 currents…',
      'Charting playtime — 3,127 fathoms…',
      'Trophies retrieved from the deep — 2,841.',
      'The water is calm. Begin.',
    ],
    pageTransition: 'tide',
    grain: false,
  },
}

const themeKey = ref<ThemeKey>((localStorage.getItem('sf-theme') as ThemeKey) ?? 'pixel')

export function applyTheme(key: ThemeKey): void {
  const theme = SF_THEMES[key] ?? SF_THEMES.pixel
  const root = document.documentElement
  Object.entries(theme.colors).forEach(([k, v]) => root.style.setProperty(`--${k}`, v))
  root.style.setProperty('--pixel', theme.fonts.heading)
  root.style.setProperty('--sans', theme.fonts.body)
  root.style.setProperty('--mono', theme.fonts.mono)
  root.style.setProperty('--cursor', SF_CURSORS[theme.cursor] ?? 'auto')
  root.setAttribute('data-theme', key)
}

// Apply immediately on module load to avoid FOUC
applyTheme(themeKey.value)

export function useTheme() {
  function setTheme(key: ThemeKey) {
    themeKey.value = key
    applyTheme(key)
    localStorage.setItem('sf-theme', key)
  }
  return { themeKey: readonly(themeKey), setTheme, applyTheme }
}
