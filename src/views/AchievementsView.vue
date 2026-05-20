<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { getOwnedGames, getPlayerAchievements } from '@/services/steamApi'
import type { SteamAchievement, SteamOwnedGame } from '@/types/steam'
import { useI18n } from '@/composables/useI18n'
import { useSound } from '@/composables/useSound'
import PixelIcon from '@/components/shared/PixelIcon.vue'

const { t } = useI18n()
const { click } = useSound()

const ACHIEVEMENT_UNLOCKED: SteamAchievement['achieved'] = 1

const games = ref<SteamOwnedGame[]>([])
const selectedGameId = ref<number | null>(null)
const achievements = ref<SteamAchievement[]>([])
const loadingGames = ref(true)
const loadingAchievements = ref(false)
const error = ref('')

const unlockedCount = computed(() => achievements.value.filter(a => a.achieved === ACHIEVEMENT_UNLOCKED).length)
const completion = computed(() => {
  if (!achievements.value.length) return 0
  return Math.round((unlockedCount.value / achievements.value.length) * 100)
})

const selectedGame = computed(() => games.value.find(g => g.appid === selectedGameId.value))

const pbarVariant = computed(() => {
  if (completion.value === 100) return 'xp'
  if (completion.value >= 50) return ''
  return 'rare'
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
    error.value = err instanceof Error ? err.message : 'Unable to load games.'
  } finally {
    loadingGames.value = false
  }
})

watch(selectedGameId, (appId) => {
  if (appId) void loadAchievements(appId)
}, { immediate: true })

function gameHeaderUrl(appId: number) {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`
}
</script>

<template>
  <div>
    <div class="section-h">
      <h2>{{ t('nav.achievements').toUpperCase() }}</h2>
      <span class="meta" v-if="!loadingGames && selectedGame">
        <template v-if="!loadingAchievements && achievements.length">
          {{ unlockedCount }} / {{ achievements.length }} · {{ completion }}% completion
        </template>
      </span>
    </div>

    <p v-if="loadingGames" style="color:var(--text-mute);padding:40px;text-align:center;font-family:var(--pixel);font-size:10px;">
      Loading games…
    </p>

    <template v-else>
      <!-- Game selector -->
      <div class="toolbar">
        <div class="field" style="max-width:420px">
          <PixelIcon kind="library" :size="14" color="var(--text-mute)" />
          <select
            v-model.number="selectedGameId"
            style="background:none;border:none;outline:none;flex:1;color:var(--text);font:inherit;cursor:pointer"
            @change="click()"
          >
            <option v-for="game in games" :key="game.appid" :value="game.appid">
              {{ game.name }}
            </option>
          </select>
        </div>
      </div>

      <p v-if="error" style="color:var(--bad);padding:12px 0;">{{ error }}</p>

      <!-- Progress summary card -->
      <div v-if="selectedGame && !loadingAchievements" class="pcard ach-game" style="margin-bottom:16px">
        <div class="acov" style="overflow:hidden">
          <img
            :src="gameHeaderUrl(selectedGame.appid)"
            :alt="selectedGame.name"
            style="width:100%;height:100%;object-fit:cover"
          />
        </div>
        <div>
          <div class="agname">{{ selectedGame.name }}</div>
          <div class="ameta">
            {{ unlockedCount }} of {{ achievements.length }} {{ t('ach.unlockedSuffix') }}
          </div>
          <div style="margin-top:10px">
            <div class="pbar" :class="pbarVariant">
              <i :style="{ width: `${completion}%` }" />
            </div>
          </div>
        </div>
        <div class="pct">
          {{ completion }}%
          <small>COMPLETION</small>
        </div>
      </div>

      <p v-if="loadingAchievements" style="color:var(--text-mute);padding:20px;text-align:center;font-family:var(--pixel);font-size:10px;">
        Loading achievements…
      </p>
      <p v-else-if="achievements.length === 0" style="color:var(--text-mute);padding:20px;text-align:center;">
        This game has no achievements.
      </p>

      <!-- Achievement list -->
      <div v-else class="pcard">
        <div class="feed">
          <div
            v-for="achievement in achievements"
            :key="achievement.apiname"
            class="feed-row"
          >
            <div
              class="ico"
              :style="{
                background: achievement.achieved === 1
                  ? 'radial-gradient(circle, var(--xp), var(--bg-deep))'
                  : 'var(--bg-panel)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }"
            >
              <PixelIcon
                :kind="achievement.achieved === 1 ? 'trophy' : 'star'"
                :size="20"
                :color="achievement.achieved === 1 ? 'var(--xp)' : 'var(--text-mute)'"
              />
            </div>
            <div>
              <div class="ftitle" :style="{ color: achievement.achieved === 1 ? 'var(--text)' : 'var(--text-mute)' }">
                {{ achievement.name ?? achievement.apiname }}
              </div>
              <div class="fmeta">{{ achievement.description ?? 'No description.' }}</div>
            </div>
            <div class="dur" :style="{ color: achievement.achieved === 1 ? 'var(--xp)' : 'var(--text-mute)' }">
              {{ achievement.achieved === 1 ? '✓' : '○' }}
              <small>{{ achievement.achieved === 1 ? t('ach.unlockedSuffix') : 'locked' }}</small>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
