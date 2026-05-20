<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Sidebar from '@/components/layout/Sidebar.vue'
import Topbar from '@/components/layout/Topbar.vue'
import BootLoader from '@/components/ui/BootLoader.vue'
import Particles from '@/components/ui/Particles.vue'
import PageTransition from '@/components/ui/PageTransition.vue'
import SearchPalette from '@/components/ui/SearchPalette.vue'
import BottomNav from '@/components/ui/BottomNav.vue'
import { usePlayerSummary } from '@/composables/usePlayerSummary'
import { useTheme, SF_THEMES } from '@/composables/useTheme'
import { useSound } from '@/composables/useSound'
import { useI18n } from '@/composables/useI18n'
import { getOwnedGames } from '@/services/steamApi'
import type { SteamOwnedGame } from '@/types/steam'

const { player } = usePlayerSummary()
const { themeKey } = useTheme()
const { click } = useSound()
const { t } = useI18n()
const route = useRoute()

const sidebarCollapsed = ref(false)

// ——— Boot loader ———
const booting = ref(!sessionStorage.getItem('sf-booted'))

function onBootDone() {
  booting.value = false
  sessionStorage.setItem('sf-booted', '1')
}

// ——— Favicon from Steam avatar ———
watch(player, (p) => {
  if (!p?.avatarfull) return
  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]') ?? document.createElement('link')
  link.rel = 'icon'
  link.href = p.avatarfull
  if (!link.parentNode) document.head.appendChild(link)
}, { immediate: true })

// ——— Page transitions ———
const transKind = ref<'pixel' | 'fade' | 'glitch' | 'warp' | 'leaves' | 'tide' | null>(null)

watch(route, () => {
  const theme = SF_THEMES[themeKey.value]
  transKind.value = theme.pageTransition as typeof transKind.value
})

function onTransDone() {
  transKind.value = null
}

// ——— Search palette ———
const paletteOpen = ref(false)
const libraryGames = ref<SteamOwnedGame[]>([])

onMounted(async () => {
  try {
    libraryGames.value = await getOwnedGames()
  } catch { /* non-critical */ }
})

function openPalette() {
  paletteOpen.value = true
}

function onGlobalKey(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    paletteOpen.value = true
    click()
    return
  }
  if (!paletteOpen.value && e.key === '/' && (e.target as HTMLElement).tagName !== 'INPUT') {
    e.preventDefault()
    paletteOpen.value = true
    click()
    return
  }
  checkKonami(e.key)
}

onMounted(() => window.addEventListener('keydown', onGlobalKey))
onUnmounted(() => window.removeEventListener('keydown', onGlobalKey))

// ——— Konami easter egg ———
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']
const konamiSeq = ref<string[]>([])
const konamiActive = ref(false)
const showCoins = ref(false)
const konamiCoins = ref<{ left: string; delay: string; dur: string }[]>([])

function checkKonami(key: string) {
  konamiSeq.value = [...konamiSeq.value, key].slice(-KONAMI.length)
  if (konamiSeq.value.join(',') === KONAMI.join(',')) {
    triggerKonami()
  }
}

function triggerKonami() {
  konamiActive.value = true
  showCoins.value = true
  konamiCoins.value = Array.from({ length: 40 }, () => ({
    left: `${Math.random() * 100}%`,
    delay: `${(Math.random() * 0.6).toFixed(2)}s`,
    dur: `${(0.8 + Math.random() * 0.6).toFixed(2)}s`,
  }))
  setTimeout(() => { showCoins.value = false }, 3000)
  setTimeout(() => { konamiActive.value = false }, 4000)
  konamiSeq.value = []
}

// ——— Cache stale banner ———
const showStaleBanner = ref(false)

onMounted(() => {
  const last = localStorage.getItem('sf-last-sync')
  if (last) {
    const age = Date.now() - Number(last)
    if (age > 2 * 24 * 60 * 60 * 1000) showStaleBanner.value = true
  }
  // Record this session as the latest sync
  if (!last) localStorage.setItem('sf-last-sync', String(Date.now()))
})

function dismissStale() {
  showStaleBanner.value = false
  localStorage.setItem('sf-last-sync', String(Date.now()))
}
</script>

<template>
  <div>
    <!-- Ambient particles (fixed, behind everything) -->
    <Particles />

    <!-- Boot loader (once per session) -->
    <BootLoader v-if="booting" @done="onBootDone" />

    <!-- Page transition overlay -->
    <PageTransition
      v-if="transKind"
      :kind="transKind"
      @done="onTransDone"
    />

    <!-- Search palette -->
    <SearchPalette
      :open="paletteOpen"
      :games="libraryGames"
      @close="paletteOpen = false"
    />

    <!-- Cache stale banner -->
    <Teleport to="body">
      <div v-if="showStaleBanner" style="position:fixed;top:0;left:0;right:0;z-index:7000;background:var(--bg-panel);border-bottom:1px solid var(--xp);padding:8px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px;font-size:12px;font-family:var(--mono);">
        <span style="color:var(--xp)">⚠ {{ t('cache.stale') }}</span>
        <button style="font-family:var(--pixel);font-size:8px;color:var(--text-mute);letter-spacing:1px;" @click="dismissStale">{{ t('cache.dismiss').toUpperCase() }}</button>
      </div>
    </Teleport>

    <!-- Konami coin rain -->
    <Teleport to="body">
      <div v-if="showCoins" class="sf-coin-rain">
        <div
          v-for="(coin, i) in konamiCoins"
          :key="i"
          class="sf-coin"
          :style="`left:${coin.left};animation-delay:${coin.delay};animation-duration:${coin.dur}`"
        />
      </div>
      <div v-if="konamiActive" class="sf-konami-toast">
        ↑↑↓↓←→←→BA · ACHIEVEMENT UNLOCKED
      </div>
    </Teleport>

    <!-- Main app shell -->
    <div v-if="!booting" class="app" :class="{ collapsed: sidebarCollapsed }">
      <Sidebar :collapsed="sidebarCollapsed" @toggle="sidebarCollapsed = !sidebarCollapsed" />
      <main class="main">
        <Topbar @search="openPalette" />
        <div class="page">
          <RouterView />
        </div>
      </main>
    </div>

    <!-- Mobile bottom nav -->
    <BottomNav />
  </div>
</template>
