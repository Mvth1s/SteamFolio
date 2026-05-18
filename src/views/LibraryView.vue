<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getOwnedGames } from '@/services/steamApi'
import type { LibrarySortOption, SteamOwnedGame } from '@/types/steam'
import { buildGameIconUrl, formatPlaytime, sortAndFilterGames } from '@/utils/steamFormatters'

const games = ref<SteamOwnedGame[]>([])
const loading = ref(true)
const error = ref('')
const search = ref('')
const sort = ref<LibrarySortOption>('name-asc')

const filteredGames = computed(() => sortAndFilterGames(games.value, search.value, sort.value))

onMounted(async () => {
  try {
    games.value = await getOwnedGames()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load game library.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-lg">
    <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
      <h2 class="text-xl font-semibold text-white">Game library</h2>

      <div class="flex flex-wrap gap-2">
        <input
          v-model="search"
          type="search"
          placeholder="Filter games"
          class="rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100"
        />

        <select
          v-model="sort"
          class="rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="playtime-desc">Playtime (high-low)</option>
          <option value="playtime-asc">Playtime (low-high)</option>
        </select>
      </div>
    </div>

    <p v-if="loading" class="text-slate-300">Loading games...</p>
    <p v-else-if="error" class="text-red-300">{{ error }}</p>

    <ul v-else class="space-y-2">
      <li
        v-for="game in filteredGames"
        :key="game.appid"
        class="flex items-center gap-3 rounded-md border border-slate-700 bg-slate-900 p-3"
      >
        <img :src="buildGameIconUrl(game.appid, game.img_icon_url)" :alt="`${game.name} icon`" class="h-10 w-10 rounded" />
        <div class="min-w-0">
          <p class="truncate font-medium text-slate-100">{{ game.name }}</p>
          <p class="text-sm text-slate-300">{{ formatPlaytime(game.playtime_forever) }} played</p>
        </div>
      </li>
    </ul>
  </section>
</template>
