<script setup lang="ts">
import { watch } from 'vue'
import NavBar from '@/components/layout/NavBar.vue'
import { RouterView } from 'vue-router'
import { usePlayerSummary } from '@/composables/usePlayerSummary'

const { player } = usePlayerSummary()

watch(player, (p) => {
  if (!p?.avatarfull) return
  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]') ?? document.createElement('link')
  link.rel = 'icon'
  link.href = p.avatarfull
  if (!link.parentNode) document.head.appendChild(link)
}, { immediate: true })
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <NavBar />

    <main class="mx-auto max-w-6xl px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>
