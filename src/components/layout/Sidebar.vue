<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PixelIcon from '@/components/shared/PixelIcon.vue'
import BrandMark from '@/components/shared/BrandMark.vue'
import { usePlayerSummary } from '@/composables/usePlayerSummary'
import { useI18n } from '@/composables/useI18n'
import { useSound } from '@/composables/useSound'
import { getSteamLevel } from '@/services/steamApi'
import { useFriends } from '@/composables/useFriends'

defineProps<{ collapsed: boolean }>()
defineEmits<{ toggle: [] }>()

defineOptions({ name: 'SidebarNav' })

const router = useRouter()
const route = useRoute()
const { player } = usePlayerSummary()
const { t } = useI18n()
const { hover, nav } = useSound()

const appVersion = __APP_VERSION__
const steamLevel = ref<number | null>(null)
const { friends, load: loadFriends } = useFriends()
const onlineFriendsCount = computed(() =>
  friends.value.filter(f => f.personastate !== 0).length
)

onMounted(async () => {
  try { steamLevel.value = await getSteamLevel() } catch { /* non-critical */ }
  void loadFriends()
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
      <BrandMark :size="36" style="flex-shrink:0" />
      <div class="brand-name">
        STEAM<br />FOLIO
        <small>v{{ appVersion }}</small>
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
        <span v-if="item.name === 'friends' && onlineFriendsCount > 0" class="nav-badge">{{ onlineFriendsCount }}</span>
      </button>

      <div class="nav-section-label" style="margin-top:14px">{{ t('nav.quick') }}</div>
      <button
        class="nav-item"
        :class="{ active: isActive('wishlist') }"
        :data-label="t('nav.wishlist')"
        @click="navigate('/wishlist')"
        @mouseenter="hover()"
      >
        <span class="nav-icon"><PixelIcon kind="star" :size="18" :color="isActive('wishlist') ? 'var(--accent)' : 'currentColor'" /></span>
        <span>{{ t('nav.wishlist') }}</span>
      </button>
      <button
        class="nav-item"
        :class="{ active: isActive('reviews') }"
        :data-label="t('nav.reviews')"
        @click="navigate('/reviews')"
        @mouseenter="hover()"
      >
        <span class="nav-icon"><PixelIcon kind="chart" :size="18" :color="isActive('reviews') ? 'var(--accent)' : 'currentColor'" /></span>
        <span>{{ t('nav.reviews') }}</span>
      </button>
      <button
        class="nav-item"
        :class="{ active: isActive('screenshots') }"
        :data-label="t('nav.screenshots')"
        @click="navigate('/screenshots')"
        @mouseenter="hover()"
      >
        <span class="nav-icon"><PixelIcon kind="image" :size="18" :color="isActive('screenshots') ? 'var(--accent)' : 'currentColor'" /></span>
        <span>{{ t('nav.screenshots') }}</span>
      </button>
    </nav>

    <div class="sidebar-footer">
      <div class="player-card">
        <img
            v-if="player?.avatarfull"
            :src="player.avatarfull"
            :alt="player?.personaname"
            style="width:38px;height:38px;object-fit:cover;flex-shrink:0;border:1px solid var(--line-soft)"
          />
          <div v-else style="width:38px;height:38px;background:var(--bg-panel);flex-shrink:0" />
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
