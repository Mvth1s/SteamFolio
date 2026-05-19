<script setup lang="ts">
import { onMounted } from 'vue'
import NavBar from '@/components/layout/NavBar.vue'
import { RouterView } from 'vue-router'
import { getPlayerSummary } from '@/services/steamApi'

onMounted(async () => {
  const player = await getPlayerSummary().catch(() => null)
  if (!player?.avatarfull) return
  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]') ?? document.createElement('link')
  link.rel = 'icon'
  link.href = player.avatarfull
  if (!link.parentNode) document.head.appendChild(link)
})
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <NavBar />

    <main class="mx-auto max-w-6xl px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>
