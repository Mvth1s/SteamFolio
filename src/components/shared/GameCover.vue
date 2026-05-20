<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  hue?: number
  hue2?: number
}>(), { hue: 200, hue2: 280 })

function hash(str: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h
}

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6D2B79F5) >>> 0
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const data = computed(() => {
  const cols = 24, rows = 14
  const rng = mulberry32(hash(props.name + props.hue))
  const hue = props.hue
  const hue2 = props.hue2
  const sky1  = `oklch(0.30 0.12 ${hue})`
  const sky2  = `oklch(0.45 0.16 ${hue})`
  const sky3  = `oklch(0.60 0.18 ${(hue + hue2) / 2})`
  const sun   = `oklch(0.85 0.16 ${(hue + 30) % 360})`
  const land  = `oklch(0.28 0.09 ${hue2})`
  const landDk = `oklch(0.18 0.08 ${hue2})`

  const horizon = Math.floor(rows * 0.62)
  const sunX = 4 + Math.floor(rng() * 6)
  const sunY = Math.max(2, horizon - 4 - Math.floor(rng() * 3))

  const mts: number[] = []
  for (let x = 0; x < cols; x++) {
    const base = horizon - 2
    mts.push(base - Math.floor(Math.abs(Math.sin((x + rng() * 2) * 0.6)) * 3))
  }

  const out: string[] = []
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let c: string
      if (y < horizon - 4) c = sky1
      else if (y < horizon - 2) c = sky2
      else if (y < horizon) c = sky3
      else if (y < horizon + 1) c = landDk
      else c = land

      const dx = x - sunX, dy = y - sunY
      if (dx * dx + dy * dy <= 3) c = sun

      if (y >= (mts[x] ?? 0) && y < horizon) c = `oklch(0.25 0.08 ${(hue + hue2) / 2})`
      if (y < horizon - 5 && rng() > 0.985) c = '#ffffff'

      out.push(c)
    }
  }
  return { out, cols, rows }
})
</script>

<template>
  <div
    :style="{
      width: '100%',
      height: '100%',
      display: 'grid',
      gridTemplateColumns: `repeat(${data.cols}, 1fr)`,
      gridTemplateRows: `repeat(${data.rows}, 1fr)`,
      position: 'relative',
    }"
  >
    <div v-for="(c, i) in data.out" :key="i" :style="{ background: c }" />
    <div style="position:absolute;inset:0;background:linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.7) 100%);display:flex;align-items:flex-end;padding:8px 10px;">
      <div style="font-family:var(--pixel);font-size:8px;color:#fff;text-shadow:2px 2px 0 #000,-1px 1px 0 #000,1px -1px 0 #000;letter-spacing:0.5px;line-height:1.3;">
        {{ name }}
      </div>
    </div>
  </div>
</template>
