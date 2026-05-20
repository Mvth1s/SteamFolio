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
  try {
    const [achs, rars] = await Promise.allSettled([
      getPlayerAchievements(appId),
      getAchievementRarities(appId),
    ])
    achievements.value = achs.status === 'fulfilled' ? achs.value : []
    rarities.value = rars.status === 'fulfilled' ? rars.value : {}
  } catch (err) {
    achievements.value = []
    error.value = err instanceof Error ? err.message : 'Unable to load achievements.'
  } finally {
    loadingAch.value = false
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

function formatUnlockDate(ts: number): string {
  if (!ts) return 'Unknown'
  return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div>
    <div class="section-h">
      <h2>{{ t('nav.achievements').toUpperCase() }}</h2>
      <span v-if="!loadingGames && achievements.length" class="meta">
        {{ unlocked.length }} / {{ achievements.length }} · {{ completion }}% completion
      </span>
    </div>

    <p v-if="loadingGames" style="color:var(--text-mute);padding:40px;text-align:center;font-family:var(--pixel);font-size:10px;">
      Loading games…
    </p>

    <template v-else>
      <!-- Stat cards -->
      <div v-if="achievements.length" class="grid stats" style="margin-bottom:18px">
        <div class="pcard stat">
          <div class="stat-icon"><PixelIcon kind="trophy" :size="22" color="var(--accent)" /></div>
          <div class="stat-label">{{ t('ach.unlocked') }}</div>
          <div class="stat-value">{{ unlocked.length.toLocaleString() }}</div>
          <div class="stat-foot"><span class="muted">of {{ achievements.length }}</span></div>
        </div>
        <div class="pcard stat">
          <div class="stat-icon"><PixelIcon kind="star" :size="22" color="var(--rare)" /></div>
          <div class="stat-label">{{ t('ach.rare') }}</div>
          <div class="stat-value" style="color:var(--rare)">{{ rare.length }}</div>
          <div class="stat-foot"><span class="muted">rarity &lt; 10%</span></div>
        </div>
        <div class="pcard stat">
          <div class="stat-icon"><PixelIcon kind="fire" :size="22" color="var(--xp)" /></div>
          <div class="stat-label">{{ t('ach.perfect') }}</div>
          <div class="stat-value" style="color:var(--xp)">{{ perfect }}</div>
          <div class="stat-foot"><span class="muted">100% completion</span></div>
        </div>
        <div class="pcard stat">
          <div class="stat-icon"><PixelIcon kind="chart" :size="22" color="var(--good)" /></div>
          <div class="stat-label">{{ t('ach.globalRate') }}</div>
          <div class="stat-value">{{ completion }}<span class="unit">%</span></div>
          <div class="stat-foot"><span class="muted">this game</span></div>
        </div>
      </div>

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

      <!-- Progress card -->
      <div v-if="selectedGame && !loadingAch" class="pcard ach-game" style="margin-bottom:16px">
        <div class="acov" style="overflow:hidden">
          <img :src="gameHeaderUrl(selectedGame.appid)" :alt="selectedGame.name" style="width:100%;height:100%;object-fit:cover" />
        </div>
        <div>
          <div class="agname">{{ selectedGame.name }}</div>
          <div class="ameta">{{ unlocked.length }} of {{ achievements.length }} {{ t('ach.unlockedSuffix') }}</div>
          <div style="margin-top:10px">
            <div class="pbar" :class="pbarVariant"><i :style="{ width: `${completion}%` }" /></div>
          </div>
        </div>
        <div class="pct">{{ completion }}%<small>COMPLETION</small></div>
      </div>

      <p v-if="loadingAch" style="color:var(--text-mute);padding:20px;text-align:center;font-family:var(--pixel);font-size:10px;">
        Loading achievements…
      </p>
      <p v-else-if="achievements.length === 0" style="color:var(--text-mute);padding:20px;text-align:center;">
        This game has no achievements.
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
                  {{ (rarities[ach.apiname] ?? 0).toFixed(1) }}%
                  <small>{{ t('ach.rarity') }}</small>
                </template>
                <template v-else>
                  {{ ach.achieved === 1 ? '✓' : '○' }}
                  <small>{{ ach.achieved === 1 ? t('ach.unlockedSuffix') : 'locked' }}</small>
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
                    {{ (rarities[ach.apiname] ?? 0).toFixed(1) }}%
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
