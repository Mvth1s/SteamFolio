<script setup lang="ts">
import { onMounted } from 'vue'

defineProps<{ kind: 'pixel' | 'fade' | 'glitch' | 'warp' | 'leaves' | 'tide' }>()
const emit = defineEmits<{ done: [] }>()
defineOptions({ name: 'PageTransition' })

const pixelCols = 32
const pixelRows = 18
const pixelCells = Array.from({ length: pixelCols * pixelRows }, () => ({
  delay: (Math.random() * 0.3).toFixed(2),
}))

const warpLines = Array.from({ length: 24 }, () => ({
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  delay: `${(Math.random() * 0.2).toFixed(2)}s`,
}))

const leavesItems = Array.from({ length: 30 }, () => ({
  left: `${Math.random() * 100}%`,
  delay: `${(Math.random() * 0.3).toFixed(2)}s`,
  transform: `rotate(${Math.random() * 360}deg)`,
}))

onMounted(() => {
  setTimeout(() => emit('done'), 700)
})
</script>

<template>
  <div :class="`sf-trans sf-trans-${kind}`">
    <template v-if="kind === 'pixel'">
      <div
        class="sf-pix-dissolve"
        :style="`grid-template-columns:repeat(${pixelCols},1fr);grid-template-rows:repeat(${pixelRows},1fr)`"
      >
        <i v-for="(cell, i) in pixelCells" :key="i" :style="`animation-delay:${cell.delay}s`" />
      </div>
    </template>

    <template v-else-if="kind === 'fade'">
      <div class="sf-trans-fade" />
    </template>

    <template v-else-if="kind === 'glitch'">
      <div class="sf-glitch-overlay">
        <div class="sf-glitch-r" />
        <div class="sf-glitch-b" />
        <div class="sf-glitch-scan" />
      </div>
    </template>

    <template v-else-if="kind === 'warp'">
      <div class="sf-warp">
        <i
          v-for="(line, i) in warpLines"
          :key="i"
          :style="`top:${line.top};left:${line.left};animation-delay:${line.delay}`"
        />
      </div>
    </template>

    <template v-else-if="kind === 'leaves'">
      <div class="sf-leaves-fall">
        <i
          v-for="(leaf, i) in leavesItems"
          :key="i"
          :style="`left:${leaf.left};animation-delay:${leaf.delay};transform:${leaf.transform}`"
        />
      </div>
    </template>

    <template v-else-if="kind === 'tide'">
      <div class="sf-tide">
        <div class="sf-tide-wave" />
        <div class="sf-tide-wave w2" />
      </div>
    </template>
  </div>
</template>
