<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTheme, SF_THEMES } from '@/composables/useTheme'
import { useI18n } from '@/composables/useI18n'

const emit = defineEmits<{ done: [] }>()
defineOptions({ name: 'BootLoader' })

const { themeKey } = useTheme()
const { lang } = useI18n()

const DURATION = 5000
const progress = ref(0)
const shownLines = ref(0)

onMounted(() => {
  const theme = SF_THEMES[themeKey.value] ?? SF_THEMES.pixel
  const lines = theme.bootLines
  const start = Date.now()
  let raf = 0

  function tick() {
    const t = Math.min(1, (Date.now() - start) / DURATION)
    progress.value = t
    shownLines.value = Math.min(lines.length, Math.floor(t * (lines.length + 0.1)))
    if (t < 1) {
      raf = requestAnimationFrame(tick)
    } else {
      setTimeout(() => emit('done'), 300)
    }
  }
  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
})
</script>

<template>
  <div class="sf-boot" :data-theme="themeKey">
    <div class="sf-boot-inner">
      <div class="sf-boot-mark">
        <div style="width:64px;height:64px;background:var(--accent);display:flex;align-items:center;justify-content:center;font-family:var(--pixel);font-size:16px;color:var(--bg-deep);letter-spacing:1px;">
          SF
        </div>
      </div>
      <div class="sf-boot-name">STEAMFOLIO</div>
      <div class="sf-boot-sub">
        {{ SF_THEMES[themeKey].label.toUpperCase() }} · {{ lang.toUpperCase() }}
      </div>

      <div class="sf-boot-lines">
        <div
          v-for="(line, i) in SF_THEMES[themeKey].bootLines.slice(0, shownLines)"
          :key="i"
          class="sf-boot-line"
        >{{ line }}</div>
        <div
          v-if="shownLines < SF_THEMES[themeKey].bootLines.length"
          class="sf-boot-line sf-boot-cursor"
        >▎</div>
      </div>

      <div class="sf-boot-barwrap">
        <div class="sf-boot-bar">
          <div class="sf-boot-fill" :style="{ width: `${progress * 100}%` }" />
        </div>
        <div class="sf-boot-pct">{{ Math.floor(progress * 100) }}%</div>
      </div>
    </div>
  </div>
</template>
