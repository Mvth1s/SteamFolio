<script setup lang="ts">
import { RouterLink } from 'vue-router'

const links = [
  { to: '/profile', label: 'Profile' },
  { to: '/library', label: 'Library' },
  { to: '/achievements', label: 'Achievements' },
  { to: '/friends', label: 'Friends' },
]
</script>

<template>
  <header class="border-b border-slate-700 bg-slate-900/90 backdrop-blur">
    <div class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">SteamFolio</h1>
        <p class="text-sm text-slate-300">Steam profile dashboard</p>
      </div>

      <nav class="flex flex-wrap gap-2">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          active-class="bg-slate-700 text-white"
        >
          {{ link.label }}
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
