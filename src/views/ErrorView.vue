<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n'

defineOptions({ name: 'ErrorView' })

const props = withDefaults(defineProps<{ kind?: '404' | '403' | '500' | 'api' }>(), { kind: '404' })
const router = useRouter()
const { t } = useI18n()

const ERR_CFG = {
  '404': { titleKey: 'err.404.title', bodyKey: 'err.404.body', accent: 'var(--accent)' },
  '403': { titleKey: 'err.403.title', bodyKey: 'err.403.body', accent: 'var(--bad)' },
  '500': { titleKey: 'err.500.title', bodyKey: 'err.500.body', accent: 'var(--xp)' },
  'api': { titleKey: 'err.api.title', bodyKey: 'err.api.body', accent: 'var(--rare)' },
} as const

const cfg = computed(() => ERR_CFG[props.kind])

// 16×12 pixel art grids — '#' = filled pixel
const ART = {
  '404': [
    '................',
    '....########....',
    '...##########...',
    '..############..',
    '..#.........#...',
    '..#.........#...',
    '..#####.#####...',
    '..############..',
    '..############..',
    '..############..',
    '..############..',
    '..##........##..',
  ],
  '403': [
    '......####......',
    '.....#....#.....',
    '.....#....#.....',
    '....######......',
    '...########.....',
    '...########.....',
    '...##.##.##.....',
    '...##.##.##.....',
    '...########.....',
    '...########.....',
    '....######......',
    '................',
  ],
  '500': [
    '....########....',
    '...##########...',
    '..############..',
    '..##.##.##.##...',
    '..##.##.##.##...',
    '..############..',
    '...##.##.##.....',
    '....########....',
    '....##.##.##....',
    '....########....',
    '................',
    '................',
  ],
  'api': [
    '.......##.......',
    '......####......',
    '.....######.....',
    '.....##..##.....',
    '....##.##.##....',
    '....##.##.##....',
    '...##..##..##...',
    '...##..##..##...',
    '..############..',
    '..############..',
    '..####....####..',
    '................',
  ],
} as const
</script>

<template>
  <div class="errpage">
    <div class="err-bigcode" :style="{ color: cfg.accent }">{{ kind === 'api' ? 'API' : kind }}</div>

    <svg width="160" height="120" viewBox="0 0 16 12" shape-rendering="crispEdges" style="margin-bottom:18px">
      <template v-for="(row, y) in ART[kind]" :key="y">
        <template v-for="(cell, x) in row.split('')" :key="x">
          <rect
            v-if="cell === '#'"
            :x="x" :y="y"
            width="1" height="1"
            :fill="cfg.accent"
          />
        </template>
      </template>
    </svg>

    <div class="err-title" :style="{ color: cfg.accent }">{{ t(cfg.titleKey) }}</div>
    <div class="err-body">{{ t(cfg.bodyKey) }}</div>
    <button class="err-back" @click="router.push('/dashboard')">{{ t('err.back') }}</button>
  </div>
</template>
