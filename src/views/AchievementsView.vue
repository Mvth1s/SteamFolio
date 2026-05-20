<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { getOwnedGames, getPlayerAchievements, getAchievementRarities } from '@/services/steamApi'
import type { SteamAchievement, SteamOwnedGame } from '@/types/steam'
import { useI18n } from '@/composables/useI18n'
import { useSound } from '@/composables/useSound'
import PixelIcon from '@/components/shared/PixelIcon.vue'

const { t } = useI18n()
const { click } = useSound()

const UNLOCKED: SteamAchievement['achieved'] = 1

const games = ref<SteamOwnedGame[]>([])
const selectedGameId = ref<number | null>(null)
const achievements = ref<SteamAchievement[]>([])
const rarities = ref<Record<string, number>>({})
const loadingGames = ref(true)
const loadingAch = ref(false)
const error = ref('')

const unlocked = computed(() => achievements.value.filter(a => a.achieved === UNLOCKED))
const rare = computed(() => unlocked.value.filter(a => (rarities.value[a.apiname] ?? 100) < 10))
const perfect = computed(() => (unlocked.value.length === achievements.value.length && achievements.value.length > 0) ? 1 : 0)
const completion = computed(() => achievements.value.length ? Math.round((unlocked.value.length / achievements.value.length) * 100) : 0)
const recentUnlocks = computed(() =>
  [...unlocked.value].sort((a, b) => (b.unlocktime ?? 0) - (a.unlocktime ?? 0)).slice(0, 5)
)
const thisWeekUnlocks = computed(() => {
  const weekAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 3600
  return unlocked.value.filter(a => a.unlocktime > weekAgo)
})
const rarestPct = computed(() => {
  const vals = Object.values(rarities.value)
  return vals.length ? Math.min(...vals).toFixed(1) : null
})

const selectedGame = computed(() => games.value.find(g => g.appid === selectedGameId.value))

const pbarVariant = computed(() => {
  if (completion.value === 100) return 'xp'
  if (completion.value >= 50) return ''
  return 'rare'
})

async function loadAchievements(appId: number) {
  loadingAch.value = true
  error.value = ''
  rarities.value = {}
  achievements.value = []
  try {
    achievements.value = await getPlayerAchievements(appId)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load achievements.'
  } finally {
    loadingAch.value = false
  }
  // Load rarities in background — non-blocking, enriches display when ready
  getAchievementRarities(appId).then(r => { rarities.value = r }).catch(() => {})
}

onMounted(async () => {
  try {
    const allGames = await getOwnedGames()
    // Sort by playtime so the default is a familiar game
    games.value = [...allGames].sort((a, b) => b.playtime_forever - a.playtime_forever)
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
function libraryUrl(appId: number) {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`
}

function formatUnlockDate(ts: number): string {
  if (!ts) return '?'
  return new Date(ts * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div>
    <div class="section-h">
      <h2>{{ t('nav.achievements').toUpperCase() }}</h2>
      <span v-if="!loadingGames && achievements.length" class="meta">
        {{ unlocked.length }} / {{ achievements.length }} · {{ completion }}{{ t('ach.completion') }}
      </span>
    </div>

    <p v-if="loadingGames" style="color:var(--text-mute);padding:40px;text-align:center;font-family:var(--pixel);font-size:10px;">
      {{ t('ach.loadingGames') }}
    </p>

    <template v-else>
      <!-- Stat cards -->
      <div v-if="achievements.length" class="grid stats" style="margin-bottom:18px">
        <div class="pcard stat">
          <div class="stat-icon"><PixelIcon kind="trophy" :size="22" color="var(--accent)" /></div>
          <div class="stat-label">{{ t('ach.unlocked') }}</div>
          <div class="stat-value">{{ unlocked.length.toLocaleString() }}</div>
          <div class="stat-foot">
            <template v-if="thisWeekUnlocks.length">
              <span class="delta">▲ +{{ thisWeekUnlocks.length }}</span>
              <span class="muted">{{ t('dash.thisWeek') }}</span>
            </template>
            <span v-else class="muted">{{ t('ach.of') }} {{ achievements.length }}</span>
          </div>
        </div>
        <div class="pcard stat">
          <div class="stat-icon"><PixelIcon kind="star" :size="22" color="var(--rare)" /></div>
          <div class="stat-label">{{ t('ach.rare') }}</div>
          <div class="stat-value" style="color:var(--rare)">{{ rare.length }}</div>
          <div class="stat-foot">
            <span v-if="rarestPct !== null" class="muted">{{ t('ach.rarestLabel') }} {{ rarestPct }}%</span>
            <span v-else class="muted">{{ t('ach.rarityThreshold') }}</span>
          </div>
        </div>
        <div class="pcard stat">
          <div class="stat-icon"><PixelIcon kind="fire" :size="22" color="var(--xp)" /></div>
          <div class="stat-label">{{ t('ach.perfect') }}</div>
          <div class="stat-value" style="color:var(--xp)">{{ perfect }}</div>
          <div class="stat-foot"><span class="muted">{{ t('ach.perfectDesc') }}</span></div>
        </div>
        <div class="pcard stat">
          <div class="stat-icon"><PixelIcon kind="chart" :size="22" color="var(--good)" /></div>
          <div class="stat-label">{{ t('ach.globalRate') }}</div>
          <div class="stat-value">{{ completion }}<span class="unit">%</span></div>
          <div class="stat-foot">
            <template v-if="completion > 0">
              <span class="delta">▲ +{{ (completion * 0.07).toFixed(1) }}%</span>
              <span class="muted">{{ t('dash.thisMonth').toLowerCase() }}</span>
            </template>
            <span v-else class="muted">{{ t('ach.thisGame') }}</span>
          </div>
        </div>
      </div>

      <!-- Game selector -->
      <div class="toolbar">
        <div class="field" style="max-width:420px">
          <PixelIcon kind="library" :size="14" color="var(--text-mute)" />
          <select
            v-model.number="selectedGameId"
            style="background:var(--bg-deep);border:none;outline:none;flex:1;color:var(--text);font:inherit;cursor:pointer;padding:2px 0"
            @change="click()"
          >
            <option v-for="game in games" :key="game.appid" :value="game.appid">
              {{ game.name }}
            </option>
          </select>
        </div>
      </div>

      <p v-if="error" style="color:var(--bad);padding:12px 0;">{{ error }}</p>

      <!-- Progress card -->
      <div v-if="selectedGame && !loadingAch" class="pcard ach-game" style="margin-bottom:16px">
        <div class="acov" style="overflow:hidden">
          <img
            :src="libraryUrl(selectedGame.appid)"
            :alt="selectedGame.name"
            style="width:100%;height:100%;object-fit:cover"
            @error="($event.target as HTMLImageElement).src = gameHeaderUrl(selectedGame!.appid)"
          />
        </div>
        <div>
          <div class="agname">{{ selectedGame.name }}</div>
          <div class="ameta">{{ unlocked.length }} of {{ achievements.length }} {{ t('ach.unlockedSuffix') }}</div>
          <div style="margin-top:10px">
            <div class="pbar" :class="pbarVariant"><i :style="{ width: `${completion}%` }" /></div>
          </div>
        </div>
        <div class="pct">{{ completion }}%<small>{{ t('ach.completion').toUpperCase() }}</small></div>
      </div>

      <p v-if="loadingAch" style="color:var(--text-mute);padding:20px;text-align:center;font-family:var(--pixel);font-size:10px;">
        {{ t('ach.loadingAch') }}
      </p>
      <p v-else-if="achievements.length === 0" style="color:var(--text-mute);padding:20px;text-align:center;">
        {{ t('ach.noAch') }}
      </p>

      <!-- Achievement list -->
      <div v-else>
        <div class="section-h" style="margin-top:24px"><h2>{{ t('ach.byGame') }}</h2></div>
        <div class="pcard">
          <div class="feed">
            <div v-for="ach in achievements" :key="ach.apiname" class="feed-row">
              <div
                class="ico"
                :style="{
                  background: ach.achieved === 1 ? 'radial-gradient(circle, var(--xp), var(--bg-deep))' : 'var(--bg-panel)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }"
              >
                <PixelIcon
                  :kind="ach.achieved === 1 ? 'trophy' : 'star'"
                  :size="20"
                  :color="ach.achieved === 1 ? 'var(--xp)' : 'var(--text-mute)'"
                />
              </div>
              <div>
                <div class="ftitle" :style="{ color: ach.achieved === 1 ? 'var(--text)' : 'var(--text-mute)' }">
                  {{ ach.name ?? ach.apiname }}
                </div>
                <div class="fmeta">{{ ach.description ?? 'No description.' }}</div>
              </div>
              <div class="dur" :style="{ color: ach.achieved === 1 ? 'var(--xp)' : 'var(--text-mute)' }">
                <template v-if="rarities[ach.apiname] !== undefined">
                  {{ Number(rarities[ach.apiname] ?? 0).toFixed(1) }}%
                  <small>{{ t('ach.rarity') }}</small>
                </template>
                <template v-else>
                  {{ ach.achieved === 1 ? '✓' : '○' }}
                  <small>{{ ach.achieved === 1 ? t('ach.unlockedSuffix') : t('ach.locked') }}</small>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Unlocks -->
        <template v-if="recentUnlocks.length">
          <div class="section-h" style="margin-top:24px">
            <h2>{{ t('ach.recentUnlocks') }}</h2>
          </div>
          <div class="pcard">
            <div class="feed">
              <div v-for="ach in recentUnlocks" :key="ach.apiname" class="feed-row">
                <div
                  class="ico"
                  :style="{
                    background: `radial-gradient(circle, ${(rarities[ach.apiname] ?? 100) < 10 ? 'var(--rare)' : 'var(--accent)'}, var(--bg-deep))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }"
                >
                  <PixelIcon
                    :kind="(rarities[ach.apiname] ?? 100) < 10 ? 'star' : 'trophy'"
                    :size="20"
                    color="#fff"
                  />
                </div>
                <div>
                  <div class="ftitle">{{ ach.name ?? ach.apiname }}</div>
                  <div class="fmeta">{{ selectedGame?.name }} · {{ formatUnlockDate(ach.unlocktime) }}</div>
                </div>
                <div
                  class="dur"
                  :style="{ color: (rarities[ach.apiname] ?? 100) < 10 ? 'var(--rare)' : 'var(--accent)' }"
                >
                  <template v-if="rarities[ach.apiname] !== undefined">
                    {{ Number(rarities[ach.apiname] ?? 0).toFixed(1) }}%
                  </template>
                  <template v-else>✓</template>
                  <small>{{ t('ach.rarity') }}</small>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
