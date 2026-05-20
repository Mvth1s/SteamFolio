<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useTheme, SF_THEMES } from '@/composables/useTheme'

defineOptions({ name: 'AmbientParticles' })

const { themeKey } = useTheme()
const canvas = ref<HTMLCanvasElement | null>(null)

let raf = 0
let stopped = false

function rand(a: number, b: number) { return a + Math.random() * (b - a) }

type Particle = {
  x: number; y: number; s: number; vx: number; vy: number
  tw?: number; rot?: number; rotV?: number; life?: number
}

function startAnimation(el: HTMLCanvasElement, themeK: string) {
  stopped = false
  cancelAnimationFrame(raf)

  const ctx = el.getContext('2d')!
  const theme = SF_THEMES[themeK as keyof typeof SF_THEMES] ?? SF_THEMES.pixel
  const cfg = theme.particles
  let parts: Particle[] = []

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    el.width = el.clientWidth * dpr
    el.height = el.clientHeight * dpr
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)
    init()
  }

  function init() {
    parts = []
    const W = el.clientWidth, H = el.clientHeight
    for (let i = 0; i < cfg.count; i++) {
      switch (cfg.kind) {
        case 'pixels':
          parts.push({ x: rand(0, W), y: rand(0, H), s: Math.random() > 0.5 ? 2 : 3, vy: rand(-0.25, -0.06), vx: rand(-0.05, 0.05), tw: rand(0, Math.PI * 2) }); break
        case 'dust':
          parts.push({ x: rand(0, W), y: rand(0, H), s: rand(1, 2.5), vy: rand(-0.10, -0.02), vx: rand(-0.02, 0.02), tw: rand(0, Math.PI * 2) }); break
        case 'embers':
          parts.push({ x: rand(0, W), y: rand(H, H + 50), s: rand(1, 3), vy: rand(-0.6, -0.15), vx: rand(-0.10, 0.10), tw: rand(0, Math.PI * 2), life: rand(0.5, 1) }); break
        case 'stars':
          parts.push({ x: rand(0, W), y: rand(0, H), s: rand(0.5, 1.6), vy: rand(-0.06, -0.01), vx: rand(-0.03, 0.03), tw: rand(0, Math.PI * 2) }); break
        case 'leaves':
          parts.push({ x: rand(0, W), y: rand(-30, H), s: rand(4, 8), vy: rand(0.15, 0.4), vx: rand(-0.3, 0.3), rot: rand(0, Math.PI * 2), rotV: rand(-0.02, 0.02) }); break
        case 'bubbles':
          parts.push({ x: rand(0, W), y: rand(0, H), s: rand(2, 7), vy: rand(-0.6, -0.15), vx: rand(-0.1, 0.1), tw: rand(0, Math.PI * 2) }); break
      }
    }
  }

  function tick() {
    if (stopped) return
    const W = el.clientWidth, H = el.clientHeight
    ctx.clearRect(0, 0, W, H)
    const color = cfg.color

    for (const p of parts) {
      p.x += p.vx; p.y += p.vy
      if (p.tw !== undefined) p.tw += 0.03

      if (cfg.kind === 'pixels') {
        const tw = 0.5 + Math.abs(Math.sin(p.tw!)) * 0.5
        ctx.fillStyle = color + Math.round(tw * 80 + 30).toString(16).padStart(2, '0')
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.s, p.s)
        if (p.y < -10 || p.x < -10 || p.x > W + 10) { p.y = H + 10; p.x = rand(0, W) }
      } else if (cfg.kind === 'dust') {
        const tw = 0.4 + Math.abs(Math.sin(p.tw!)) * 0.6
        ctx.fillStyle = color + Math.round(tw * 80).toString(16).padStart(2, '0')
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill()
        if (p.y < -10) { p.y = H + 10; p.x = rand(0, W) }
      } else if (cfg.kind === 'embers') {
        p.life! -= 0.004
        if (p.life! <= 0 || p.y < -20) { p.y = H + 10; p.x = rand(0, W); p.life = rand(0.5, 1) }
        ctx.fillStyle = `rgba(200,29,37,${p.life})`
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.s, p.s)
        ctx.fillStyle = `rgba(255,180,80,${p.life! * 0.5})`
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y - 1), p.s, 1)
      } else if (cfg.kind === 'stars') {
        const tw = 0.5 + Math.abs(Math.sin(p.tw! * 2)) * 0.5
        ctx.fillStyle = color + Math.round(tw * 180 + 30).toString(16).padStart(2, '0')
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s * tw, 0, Math.PI * 2); ctx.fill()
        if (p.y < -10) { p.y = H + 10; p.x = rand(0, W) }
      } else if (cfg.kind === 'leaves') {
        p.rot! += p.rotV!
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot! + Math.sin(p.y * 0.02) * 0.5)
        ctx.fillStyle = color + '99'
        ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * 0.5, 0, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = '#3a5520'; ctx.lineWidth = 0.5
        ctx.beginPath(); ctx.moveTo(-p.s, 0); ctx.lineTo(p.s, 0); ctx.stroke()
        ctx.restore()
        p.x += Math.sin(p.y * 0.02) * 0.3
        if (p.y > H + 20) { p.y = -20; p.x = rand(0, W) }
      } else if (cfg.kind === 'bubbles') {
        ctx.strokeStyle = color + '66'; ctx.lineWidth = 1
        ctx.beginPath(); ctx.arc(p.x + Math.sin(p.tw!) * 4, p.y, p.s, 0, Math.PI * 2); ctx.stroke()
        ctx.fillStyle = color + '44'
        ctx.beginPath(); ctx.arc(p.x + Math.sin(p.tw!) * 4 - p.s * 0.4, p.y - p.s * 0.4, p.s * 0.3, 0, Math.PI * 2); ctx.fill()
        if (p.y < -20) { p.y = H + 10; p.x = rand(0, W) }
      }
    }
    raf = requestAnimationFrame(tick)
  }

  const onResize = () => resize()
  window.addEventListener('resize', onResize)
  resize()
  raf = requestAnimationFrame(tick)

  return () => {
    stopped = true
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', onResize)
  }
}

let cleanup: (() => void) | null = null

onMounted(() => {
  if (canvas.value) cleanup = startAnimation(canvas.value, themeKey.value) ?? null
})

watch(themeKey, (k) => {
  cleanup?.()
  stopped = false
  if (canvas.value) cleanup = startAnimation(canvas.value, k) ?? null
})

onUnmounted(() => {
  stopped = true
  cancelAnimationFrame(raf)
  cleanup?.()
})
</script>

<template>
  <canvas ref="canvas" class="sf-particles" />
</template>
