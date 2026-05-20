import { ref, readonly } from 'vue'

// Module-level singleton state
let ctx: AudioContext | null = null
let volume = 0.18
let currentTheme = 'pixel'

const mutedRef = ref(true) // start muted

function ensure(): AudioContext | null {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    } catch {
      ctx = null
    }
  }
  if (ctx && ctx.state === 'suspended') void ctx.resume()
  return ctx
}

interface BlipOptions {
  freq?: number
  dur?: number
  type?: OscillatorType
  vol?: number
  attack?: number
  slide?: number | null
}

function blip({ freq = 440, dur = 0.08, type = 'square' as OscillatorType, vol = 1, attack = 0.005, slide = null }: BlipOptions) {
  if (mutedRef.value) return
  const c = ensure()
  if (!c) return
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, c.currentTime)
  if (slide != null) o.frequency.exponentialRampToValueAtTime(slide, c.currentTime + dur)
  g.gain.setValueAtTime(0, c.currentTime)
  g.gain.linearRampToValueAtTime(volume * vol, c.currentTime + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur)
  o.connect(g).connect(c.destination)
  o.start()
  o.stop(c.currentTime + dur + 0.02)
}

interface NoiseBurstOptions {
  dur?: number
  hp?: number
  lp?: number
  vol?: number
}

function noiseBurst({ dur = 0.08, hp = 800, lp = 4000, vol = 1 }: NoiseBurstOptions) {
  if (mutedRef.value) return
  const c = ensure()
  if (!c) return
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const s = c.createBufferSource()
  s.buffer = buf
  const g = c.createGain()
  g.gain.setValueAtTime(volume * vol, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur)
  const f = c.createBiquadFilter()
  f.type = 'bandpass'
  f.frequency.value = (hp + lp) / 2
  f.Q.value = 1
  s.connect(f).connect(g).connect(c.destination)
  s.start()
  s.stop(c.currentTime + dur)
}

type SoundKind = 'hover' | 'click' | 'open' | 'nav'

const SFX: Record<string, Record<SoundKind, () => void>> = {
  pixel: {
    hover: () => blip({ freq: 660, dur: 0.04, type: 'square', vol: 0.4 }),
    click: () => blip({ freq: 880, dur: 0.07, type: 'square', vol: 0.7, slide: 1320 }),
    open:  () => { blip({ freq: 523, dur: 0.06, type: 'square' }); setTimeout(() => blip({ freq: 784, dur: 0.06, type: 'square' }), 60); setTimeout(() => blip({ freq: 1047, dur: 0.10, type: 'square' }), 120) },
    nav:   () => blip({ freq: 440, dur: 0.06, type: 'square', vol: 0.5, slide: 660 }),
  },
  light: {
    hover: () => blip({ freq: 1200, dur: 0.03, type: 'sine', vol: 0.25 }),
    click: () => blip({ freq: 1400, dur: 0.05, type: 'sine', vol: 0.4 }),
    open:  () => blip({ freq: 880, dur: 0.10, type: 'sine', vol: 0.5 }),
    nav:   () => blip({ freq: 700, dur: 0.05, type: 'sine', vol: 0.4 }),
  },
  horror: {
    hover: () => blip({ freq: 110, dur: 0.05, type: 'triangle', vol: 0.4 }),
    click: () => blip({ freq: 90, dur: 0.15, type: 'sawtooth', vol: 0.7, slide: 40 }),
    open:  () => noiseBurst({ dur: 0.5, hp: 200, lp: 800, vol: 0.5 }),
    nav:   () => blip({ freq: 70, dur: 0.18, type: 'sawtooth', vol: 0.5 }),
  },
  space: {
    hover: () => blip({ freq: 880, dur: 0.05, type: 'sine', vol: 0.3, slide: 1200 }),
    click: () => blip({ freq: 1320, dur: 0.10, type: 'triangle', vol: 0.6, slide: 660 }),
    open:  () => blip({ freq: 220, dur: 0.4, type: 'sawtooth', vol: 0.4, slide: 1200 }),
    nav:   () => blip({ freq: 500, dur: 0.10, type: 'sine', vol: 0.5, slide: 900 }),
  },
  nature: {
    hover: () => blip({ freq: 1500, dur: 0.04, type: 'sine', vol: 0.2 }),
    click: () => { blip({ freq: 1200, dur: 0.05, type: 'sine' }); setTimeout(() => blip({ freq: 1600, dur: 0.05, type: 'sine' }), 50) },
    open:  () => blip({ freq: 800, dur: 0.30, type: 'sine', vol: 0.4 }),
    nav:   () => blip({ freq: 1000, dur: 0.05, type: 'sine', vol: 0.4 }),
  },
  ocean: {
    hover: () => blip({ freq: 500, dur: 0.07, type: 'sine', vol: 0.25, slide: 300 }),
    click: () => blip({ freq: 700, dur: 0.10, type: 'sine', vol: 0.5, slide: 200 }),
    open:  () => noiseBurst({ dur: 0.7, hp: 100, lp: 500, vol: 0.3 }),
    nav:   () => blip({ freq: 600, dur: 0.10, type: 'sine', vol: 0.4, slide: 400 }),
  },
}

function play(kind: SoundKind) {
  const set = SFX[currentTheme] ?? SFX['pixel']!
  const fn = set[kind]
  if (fn) try { fn() } catch { /* ignore audio errors */ }
}

export function useSound() {
  function setMuted(m: boolean) {
    mutedRef.value = m
  }
  function setTheme(t: string) {
    currentTheme = t
  }
  function setVolume(v: number) {
    volume = v
  }
  const hover = () => play('hover')
  const click = () => play('click')
  const open = () => play('open')
  const nav = () => play('nav')

  return {
    muted: readonly(mutedRef),
    setMuted,
    setTheme,
    setVolume,
    hover,
    click,
    open,
    nav,
  }
}
