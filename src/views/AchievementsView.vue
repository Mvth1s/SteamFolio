<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { getOwnedGames, getPlayerAchievements } from '@/services/steamApi'
import type { SteamAchievement, SteamOwnedGame } from '@/types/steam'

const games = ref<SteamOwnedGame[]>([])
const ACHIEVEMENT_UNLOCKED: SteamAchievement['achieved'] = 1

function isAchievementUnlocked(achievement: SteamAchievement): boolean {
  return achievement.achieved === ACHIEVEMENT_UNLOCKED
}
const selectedGameId = ref<number | null>(null)
const achievements = ref<SteamAchievement[]>([])
const loadingGames = ref(true)
const loadingAchievements = ref(false)
const error = ref('')

const completion = computed(() => {
  if (!achievements.value.length) {
    return 0
  }

  const unlockedCount = achievements.value.filter((achievement) => isAchievementUnlocked(achievement)).length
  return Math.round((unlockedCount / achievements.value.length) * 100)
})

async function loadAchievements(appId: number) {
  loadingAchievements.value = true
  error.value = ''

  try {
    achievements.value = await getPlayerAchievements(appId)
  } catch (err) {
    achievements.value = []
    error.value = err instanceof Error ? err.message : 'Unable to load achievements.'
  } finally {
    loadingAchievements.value = false
  }
}

onMounted(async () => {
  try {
    games.value = await getOwnedGames()
    selectedGameId.value = games.value[0]?.appid ?? null
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load games for achievements.'
  } finally {
    loadingGames.value = false
  }
})

watch(selectedGameId, (appId) => {
  if (appId) {
    void loadAchievements(appId)
  }
}, { immediate: true })
</script>

<template>
  <section class="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-lg">
    <h2 class="mb-4 text-xl font-semibold text-white">Achievements</h2>

    <p v-if="loadingGames" class="text-slate-300">Loading available games...</p>

    <template v-else>
      <div class="mb-4 flex flex-wrap items-center gap-3">
        <label for="game-select" class="text-sm text-slate-200">Select game</label>
        <select
          id="game-select"
          v-model.number="selectedGameId"
          class="rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100"
        >
          <option v-for="game in games" :key="game.appid" :value="game.appid">{{ game.name }}</option>
        </select>
      </div>

      <p v-if="error" class="mb-4 text-red-300">{{ error }}</p>

      <div class="mb-4">
        <p class="text-sm text-slate-200">Completion: <span class="font-semibold text-white">{{ completion }}%</span></p>
        <div class="mt-2 h-2 rounded-full bg-slate-700">
          <div class="h-2 rounded-full bg-emerald-400" :style="{ width: `${completion}%` }"></div>
        </div>
      </div>

      <p v-if="loadingAchievements" class="text-slate-300">Loading achievements...</p>

      <ul v-else class="space-y-2">
        <li
          v-for="achievement in achievements"
          :key="achievement.apiname"
          class="rounded-md border border-slate-700 bg-slate-900 p-3"
        >
          <p class="font-medium text-slate-100">{{ achievement.name ?? achievement.apiname }}</p>
          <p class="text-sm text-slate-300">{{ achievement.description ?? 'No description provided.' }}</p>
          <p class="text-xs" :class="isAchievementUnlocked(achievement) ? 'text-emerald-300' : 'text-slate-400'">
            {{ isAchievementUnlocked(achievement) ? 'Unlocked' : 'Locked' }}
          </p>
        </li>
      </ul>
    </template>
  </section>
</template>
