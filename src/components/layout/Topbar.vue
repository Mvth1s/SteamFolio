<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import PixelIcon from '@/components/shared/PixelIcon.vue'
import { usePlayerSummary } from '@/composables/usePlayerSummary'
import { useTheme, SF_THEMES } from '@/composables/useTheme'
import { useI18n } from '@/composables/useI18n'
import { useSound } from '@/composables/useSound'
import type { ThemeKey } from '@/types/design'

defineOptions({ name: 'TopBar' })
const emit = defineEmits<{ search: [] }>()

const route = useRoute()
const { player } = usePlayerSummary()
const { themeKey, setTheme } = useTheme()
const { t, lang, setLang } = useI18n()
const { click, open, muted, setMuted, setTheme: setSoundTheme } = useSound()

const themeOpen = ref(false)
const themeRef = ref<HTMLElement | null>(null)

const CRUMB_MAP: Record<string, { labelKey: string; crumbKey: string }> = {
  dashboard:    { labelKey: 'nav.dashboard',    crumbKey: 'crumb.overview' },
  profile:      { labelKey: 'nav.profile',      crumbKey: 'crumb.profile' },
  library:      { labelKey: 'nav.library',      crumbKey: 'crumb.collection' },
  achievements: { labelKey: 'nav.achievements', crumbKey: 'crumb.trophies' },
  friends:      { labelKey: 'nav.friends',      crumbKey: 'crumb.social' },
  wishlist:     { labelKey: 'nav.wishlist',     crumbKey: 'crumb.wishlist' },
}

const pageInfo = computed(() => CRUMB_MAP[route.name as string] ?? { labelKey: 'nav.dashboard', crumbKey: 'crumb.overview' })

function onDocClick(e: MouseEvent) {
  if (themeRef.value && !themeRef.value.contains(e.target as Node)) {
    themeOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onDocClick)
  setSoundTheme(themeKey.value)
})
onUnmounted(() => document.removeEventListener('mousedown', onDocClick))

function pickTheme(key: ThemeKey) {
  setTheme(key)
  setSoundTheme(key)
  themeOpen.value = false
  open()
}

function toggleLang() {
  setLang(lang.value === 'en' ? 'fr' : 'en')
  click()
}
</script>

<template>
  <div class="topbar">
    <div>
      <div class="page-title">{{ t(pageInfo.labelKey).toUpperCase() }}</div>
      <div class="crumb">STEAMFOLIO / {{ t(pageInfo.crumbKey) }}</div>
    </div>

    <div class="search" style="cursor:pointer" @click="emit('search')">
      <PixelIcon kind="search" :size="14" color="var(--text-mute)" />
      <input readonly :placeholder="t('common.search')" style="cursor:pointer;pointer-events:none" />
      <span style="font-family:var(--pixel);font-size:7px;color:var(--text-mute);padding:2px 5px;border:1px solid var(--line-soft);">⌘K</span>
    </div>

    <div class="tb-actions">
      <button
        class="tb-btn"
        :title="muted ? t('sound.unmute') : t('sound.mute')"
        @click="setMuted(!muted); click()"
      >
        <span style="font-size:14px">{{ muted ? '🔇' : '🔊' }}</span>
      </button>

      <button
        class="tb-btn"
        style="font-family:var(--pixel);font-size:9px;"
        :title="t('theme.label')"
        @click="toggleLang"
      >{{ lang.toUpperCase() }}</button>

      <div ref="themeRef" style="position:relative">
        <button class="tb-btn" :title="t('theme.label')" @click="themeOpen = !themeOpen; click()">
          {{ SF_THEMES[themeKey].emoji }}
        </button>
        <div v-if="themeOpen" class="tb-popup">
          <button
            v-for="theme in SF_THEMES"
            :key="theme.key"
            :class="{ on: theme.key === themeKey }"
            @click="pickTheme(theme.key)"
          >
            <span style="font-size:16px">{{ theme.emoji }}</span>
            <span>{{ theme.label }}</span>
            <div class="swatchrow">
              <span :style="{ background: theme.colors.accent }" />
              <span :style="{ background: theme.colors.xp }" />
              <span :style="{ background: theme.colors.rare }" />
            </div>
          </button>
        </div>
      </div>
    </div>

    <div class="user">
      <img
        v-if="player?.avatarfull"
        :src="player.avatarfull"
        :alt="player.personaname"
        style="width:32px;height:32px;object-fit:cover;flex-shrink:0;border:1px solid var(--line-soft)"
      />
      <div v-else style="width:32px;height:32px;background:var(--bg-panel);flex-shrink:0" />
      <div>
        <div class="uname">{{ player?.personaname ?? '…' }}</div>
        <div class="ustat">
          <span class="dot" />
          <span>{{ t('common.online') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
