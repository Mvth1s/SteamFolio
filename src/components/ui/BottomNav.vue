<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import PixelIcon from '@/components/shared/PixelIcon.vue'
import { useI18n } from '@/composables/useI18n'
import { useSound } from '@/composables/useSound'

defineOptions({ name: 'BottomNav' })

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const { nav } = useSound()

const NAV_ITEMS = [
  { to: '/dashboard',    name: 'dashboard',    icon: 'dashboard',   labelKey: 'nav.dashboard' },
  { to: '/library',      name: 'library',      icon: 'library',     labelKey: 'nav.library' },
  { to: '/achievements', name: 'achievements', icon: 'achievement', labelKey: 'nav.achievements' },
  { to: '/friends',      name: 'friends',      icon: 'friends',     labelKey: 'nav.friends' },
  { to: '/profile',      name: 'profile',      icon: 'profile',     labelKey: 'nav.profile' },
] as const

function navigate(to: string) {
  nav()
  router.push(to)
}
</script>

<template>
  <nav class="bottom-nav">
    <div class="bottom-nav-inner">
      <button
        v-for="item in NAV_ITEMS"
        :key="item.to"
        :class="{ active: route.name === item.name }"
        @click="navigate(item.to)"
      >
        <PixelIcon
          :kind="item.icon"
          :size="18"
          :color="route.name === item.name ? 'var(--accent)' : 'currentColor'"
        />
        <span>{{ t(item.labelKey) }}</span>
      </button>
    </div>
  </nav>
</template>
