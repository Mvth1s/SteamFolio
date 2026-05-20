<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterView } from 'vue-router'
import Sidebar from '@/components/layout/Sidebar.vue'
import Topbar from '@/components/layout/Topbar.vue'
import { usePlayerSummary } from '@/composables/usePlayerSummary'
import { useTheme } from '@/composables/useTheme'
import { useSound } from '@/composables/useSound'

const { player } = usePlayerSummary()
useTheme()  // initialize theme on startup
useSound()

const sidebarCollapsed = ref(false)

watch(player, (p) => {
  if (!p?.avatarfull) return
  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]') ?? document.createElement('link')
  link.rel = 'icon'
  link.href = p.avatarfull
  if (!link.parentNode) document.head.appendChild(link)
}, { immediate: true })
</script>

<template>
  <div class="app" :class="{ collapsed: sidebarCollapsed }">
    <Sidebar :collapsed="sidebarCollapsed" @toggle="sidebarCollapsed = !sidebarCollapsed" />
    <main class="main">
      <Topbar />
      <div class="page">
        <RouterView />
      </div>
    </main>
  </div>
</template>
