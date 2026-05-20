<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  seed: string
  size?: number
}>(), { size: 56 })

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

const grid = computed<string[][]>(() => {
  const rng = mulberry32(hash(props.seed))
  const hue = Math.floor(rng() * 360)
  const bg    = `oklch(0.32 0.08 ${hue})`
  const skin  = `oklch(0.78 0.12 ${(hue + 30) % 360})`
  const hair  = `oklch(0.5 0.15 ${(hue + 200) % 360})`
  const shirt = `oklch(0.58 0.18 ${(hue + 120) % 360})`
  const eye   = '#1b2838'

  const W = 8, H = 8
  const g: string[][] = Array.from({ length: H }, () => Array(W).fill(bg))

  // hair top — rows 0..1
  for (let x = 1; x < 4; x++) g[0]![x] = hair
  for (let x = 0; x < 4; x++) { if (rng() > 0.2) g[1]![x] = hair }

  // face — rows 2..4
  for (let y = 2; y < 5; y++) for (let x = 1; x < 4; x++) g[y]![x] = skin
  if (rng() > 0.4) g[2]![0] = hair
  if (rng() > 0.5) g[3]![0] = hair

  // eye and mouth
  g[3]![2] = eye
  g[4]![2] = `oklch(0.25 0.05 ${hue})`

  // body — rows 5..7
  for (let y = 5; y < 8; y++) for (let x = 0; x < 4; x++) g[y]![x] = shirt
  if (rng() > 0.4) {
    const acc = `oklch(0.7 0.18 ${(hue + 60) % 360})`
    for (let x = 0; x < 4; x++) g[5]![x] = (x === 0 || x === 3) ? acc : shirt
  }

  // mirror to right half
  for (let y = 0; y < H; y++) for (let x = 4; x < 8; x++) g[y]![x] = g[y]![7 - x]!

  return g
})

const cells = computed(() => grid.value.flatMap((row, y) => row.map((color, x) => ({ color, key: `${x}-${y}` }))))
const px = computed(() => props.size / 8)
</script>

<template>
  <div
    class="avatar"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      display: 'grid',
      gridTemplateColumns: `repeat(8, ${px}px)`,
      gridTemplateRows: `repeat(8, ${px}px)`,
      imageRendering: 'pixelated',
      boxShadow: '0 0 0 1px rgba(0,0,0,0.4) inset',
    }"
  >
    <div v-for="cell in cells" :key="cell.key" :style="{ background: cell.color }" />
  </div>
</template>
