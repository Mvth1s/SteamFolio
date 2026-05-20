<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PixelIcon from '@/components/shared/PixelIcon.vue'
import PixelAvatar from '@/components/shared/PixelAvatar.vue'
import { usePlayerSummary } from '@/composables/usePlayerSummary'
import { useI18n } from '@/composables/useI18n'
import { useSound } from '@/composables/useSound'
import { getSteamLevel } from '@/services/steamApi'

defineProps<{ collapsed: boolean }>()
defineEmits<{ toggle: [] }>()

defineOptions({ name: 'SidebarNav' })

const router = useRouter()
const route = useRoute()
const { player } = usePlayerSummary()
const { t } = useI18n()
const { hover, nav } = useSound()

const steamLevel = ref<number | null>(null)

onMounted(async () => {
  try { steamLevel.value = await getSteamLevel() } catch { /* non-critical */ }
})

const NAV_ITEMS = [
  { to: '/dashboard',    name: 'dashboard',    icon: 'dashboard',   labelKey: 'nav.dashboard' },
  { to: '/profile',      name: 'profile',      icon: 'profile',     labelKey: 'nav.profile' },
  { to: '/library',      name: 'library',      icon: 'library',     labelKey: 'nav.library' },
  { to: '/achievements', name: 'achievements', icon: 'achievement', labelKey: 'nav.achievements' },
  { to: '/friends',      name: 'friends',      icon: 'friends',     labelKey: 'nav.friends' },
] as const

function isActive(routeName: string): boolean {
  return route.name === routeName
}

function navigate(to: string) {
  nav()
  router.push(to)
}
</script>

<template>
  <aside class="sidebar">
    <button class="sidebar-toggle" @click="$emit('toggle')" aria-label="toggle sidebar">
      {{ collapsed ? '»' : '«' }}
    </button>

    <div class="brand">
      <div
        class="brand-mark"
        style="width:36px;height:36px;background:var(--accent);display:flex;align-items:center;justify-content:center;font-family:var(--pixel);font-size:9px;color:var(--bg-deep);letter-spacing:1px;flex-shrink:0;"
      >SF</div>
      <div class="brand-name">
        STEAM<br />FOLIO
        <small>{{ t('common.beta') }}</small>
      </div>
    </div>

    <nav class="nav">
      <div class="nav-section-label">{{ t('nav.menu') }}</div>
      <button
        v-for="item in NAV_ITEMS"
        :key="item.to"
        class="nav-item"
        :class="{ active: isActive(item.name) }"
        :data-label="t(item.labelKey)"
        @click="navigate(item.to)"
        @mouseenter="hover()"
      >
        <span class="nav-icon">
          <PixelIcon
            :kind="item.icon"
            :size="18"
            :color="isActive(item.name) ? 'var(--accent)' : 'currentColor'"
          />
        </span>
        <span>{{ t(item.labelKey) }}</span>
      </button>

      <div class="nav-section-label" style="margin-top:14px">{{ t('nav.quick') }}</div>
      <a
        :href="player ? `https://store.steampowered.com/wishlist/profiles/${player.steamid}/` : '#'"
        target="_blank"
        rel="noopener noreferrer"
        class="nav-item"
        :data-label="t('nav.wishlist')"
        @mouseenter="hover()"
      >
        <span class="nav-icon"><PixelIcon kind="star" :size="18" color="currentColor" /></span>
        <span>{{ t('nav.wishlist') }}</span>
      </a>
      <a
        :href="player ? `${player.profileurl}recommended/` : '#'"
        target="_blank"
        rel="noopener noreferrer"
        class="nav-item"
        :data-label="t('nav.reviews')"
        @mouseenter="hover()"
      >
        <span class="nav-icon"><PixelIcon kind="chart" :size="18" color="currentColor" /></span>
        <span>{{ t('nav.reviews') }}</span>
      </a>
    </nav>

    <div class="sidebar-footer">
      <div class="player-card">
        <PixelAvatar :seed="player?.steamid ?? 'default'" :size="38" />
        <div style="min-width:0">
          <div class="pc-name">{{ player?.personaname ?? '…' }}</div>
          <div class="pc-status">
            <span class="dot" />
            <span>{{ t('common.online') }}<template v-if="steamLevel !== null"> · LVL {{ steamLevel }}</template></span>
          </div>
        </div>
      </div>
      <div style="font-family:var(--pixel);font-size:6px;color:var(--text-mute);letter-spacing:1px;text-align:center;padding:4px;">
        {{ t('common.synced') }}
      </div>
    </div>
  </aside>
</template>
