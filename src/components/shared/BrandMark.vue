<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 36 })
defineOptions({ name: 'BrandMark' })

const G = [
  '000111000000',
  '001222100000',
  '012222210000',
  '122222221111',
  '133333333331',
  '133344333331',
  '133344333331',
  '133333333331',
  '133353333531',
  '133355555331',
  '133333333331',
  '111111111111',
] as const

const PALETTE: Record<string, string> = {
  '1': 'var(--bg-deep)',
  '2': 'var(--accent)',
  '3': 'var(--bg-panel)',
  '4': 'var(--xp)',
  '5': 'var(--rare)',
}
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 12 12" shape-rendering="crispEdges">
    <template v-for="(row, y) in G" :key="y">
      <template v-for="(cell, x) in row.split('')" :key="x">
        <rect
          v-if="cell !== '0'"
          :x="x" :y="y"
          width="1" height="1"
          :fill="PALETTE[cell]"
        />
      </template>
    </template>
  </svg>
</template>
