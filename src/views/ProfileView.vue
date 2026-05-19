<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getSteamLevel } from '@/services/steamApi'
import { usePlayerSummary } from '@/composables/usePlayerSummary'
import { formatUnixDate, getStatusLabel } from '@/utils/steamFormatters'

const { player, loading, error } = usePlayerSummary()
const steamLevel = ref<number | null>(null)

onMounted(async () => {
  try {
    steamLevel.value = await getSteamLevel()
  } catch {
    // niveau non critique — on affiche simplement rien si indisponible
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
        <div v-if="steamLevel !== null"><dt class="inline font-semibold text-white">Steam level:</dt> {{ steamLevel }}</div>
        <div><dt class="inline font-semibold text-white">Country:</dt> {{ player.loccountrycode ?? 'Unknown' }}</div>
        <div><dt class="inline font-semibold text-white">Account created:</dt> {{ formatUnixDate(player.timecreated) }}</div>
      </dl>
    </div>
  </section>
</template>
