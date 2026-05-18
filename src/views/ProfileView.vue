<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getPlayerSummary } from '@/services/steamApi'
import type { SteamPlayer } from '@/types/steam'
import { formatUnixDate, getStatusLabel } from '@/utils/steamFormatters'

const player = ref<SteamPlayer | null>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    player.value = await getPlayerSummary()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load profile data.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-lg">
    <h2 class="mb-4 text-xl font-semibold text-white">Profile overview</h2>

    <p v-if="loading" class="text-slate-300">Loading profile...</p>
    <p v-else-if="error" class="text-red-300">{{ error }}</p>
    <p v-else-if="!player" class="text-slate-300">No profile data found.</p>

    <div v-else class="grid gap-5 sm:grid-cols-[auto,1fr] sm:items-center">
      <img :src="player.avatarfull" :alt="`${player.personaname} avatar`" class="h-24 w-24 rounded-lg" />

      <dl class="grid gap-2 text-sm text-slate-200">
        <div><dt class="inline font-semibold text-white">Username:</dt> {{ player.personaname }}</div>
        <div><dt class="inline font-semibold text-white">Status:</dt> {{ getStatusLabel(player.personastate) }}</div>
        <div><dt class="inline font-semibold text-white">Country:</dt> {{ player.loccountrycode ?? 'Unknown' }}</div>
        <div><dt class="inline font-semibold text-white">Account created:</dt> {{ formatUnixDate(player.timecreated) }}</div>
      </dl>
    </div>
  </section>
</template>
