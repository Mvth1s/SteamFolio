<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import PixelIcon from '@/components/shared/PixelIcon.vue'
import { getOwnedGames, getFriends, getRecentlyPlayedGames } from '@/services/steamApi'
import { usePlayerSummary } from '@/composables/usePlayerSummary'
import { useI18n } from '@/composables/useI18n'
import { useSound } from '@/composables/useSound'
import type { SteamOwnedGame, SteamRecentGame } from '@/types/steam'

const { player } = usePlayerSummary()
const { t } = useI18n()
const { click } = useSound()

const games = ref<SteamOwnedGame[]>([])
const recent = ref<SteamRecentGame[]>([])
const friendsCount = ref<number | null>(null)
const loading = ref(true)

onMounted(async () => {
  const [g, f, r] = await Promise.allSettled([
    getOwnedGames(),
    getFriends(),
    getRecentlyPlayedGames(),
  ])
  if (g.status === 'fulfilled') games.value = g.value
  if (f.status === 'fulfilled') friendsCount.value = f.value.length
  if (r.status === 'fulfilled') recent.value = r.value
  loading.value = false
})

const totalHours = computed(() => Math.floor(games.value.reduce((s, g) => s + g.playtime_forever, 0) / 60))
const playedCount = computed(() => games.value.filter(g => g.playtime_forever > 0).length)
const topGames = computed(() => [...games.value].sort((a, b) => b.playtime_forever - a.playtime_forever).slice(0, 3))

// Top3 tabs — month/year/alltime backed by recently played + all games
const top3Tab = ref<'month' | 'year' | 'alltime'>('alltime')

const top3Games = computed(() => {
  if (top3Tab.value === 'alltime') return topGames.value
  // For month/year we use recently played as a proxy (Steam API limitation)
  return recent.value.slice(0, 3).map(r => games.value.find(g => g.appid === r.appid) ?? {
    appid: r.appid, name: r.name, playtime_forever: r.playtime_forever,
  })
})

// Currently playing live timer
const nowMs = ref(Date.now())
let timerInterval: ReturnType<typeof setInterval> | null = null

const currentGame = computed(() => recent.value[0] ?? null)

onMounted(() => {
  timerInterval = setInterval(() => { nowMs.value = Date.now() }, 1000)
})
onUnmounted(() => { if (timerInterval) clearInterval(timerInterval) })

// Approximate session start: recent game has playtime_2weeks in minutes
const sessionStartMs = computed(() => {
  if (!currentGame.value) return null
  // Treat the most recently played game as the current session estimate
  // We use last-sync time as a proxy for "session start"
  const syncTs = Number(localStorage.getItem('sf-last-sync') ?? Date.now())
  return syncTs
})

function formatHMS(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const sessionElapsed = computed(() => {
  if (!sessionStartMs.value) return null
  return Math.floor((nowMs.value - sessionStartMs.value) / 1000)
})

const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })

function gameHeaderUrl(appId: number) {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`
}

function formatHours(minutes: number): string {
  return `${Math.floor(minutes / 60)}h`
}

function formatRecent(mins2weeks: number): string {
  const h = Math.floor(mins2weeks / 60)
  const m = mins2weeks % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}
</script>

<template>
  <div>
    <div class="section-h">
      <h2>{{ t('dash.overview') }}</h2>
      <span class="meta">{{ today }}</span>
    </div>

    <!-- Stat cards -->
    <div class="grid stats">
      <div class="pcard stat">
        <div class="stat-icon"><PixelIcon kind="library" :size="22" color="var(--accent)" /></div>
        <div class="stat-label">{{ t('dash.gamesOwned') }}</div>
        <div class="stat-value">
          <span v-if="loading">—</span>
          <span v-else>{{ games.length }}</span>
        </div>
        <div class="stat-foot"><span class="muted">{{ playedCount }} played</span></div>
      </div>

      <div class="pcard stat">
        <div class="stat-icon"><PixelIcon kind="clock" :size="22" color="var(--accent)" /></div>
        <div class="stat-label">{{ t('dash.totalHours') }}</div>
        <div class="stat-value">
          <span v-if="loading">—</span>
          <template v-else>{{ totalHours.toLocaleString() }}<span class="unit">hrs</span></template>
        </div>
        <div class="stat-foot"><span class="muted">across all games</span></div>
      </div>

      <div class="pcard stat">
        <div class="stat-icon"><PixelIcon kind="friends" :size="22" color="var(--accent)" /></div>
        <div class="stat-label">FRIENDS</div>
        <div class="stat-value">
          <span v-if="friendsCount === null">—</span>
          <span v-else>{{ friendsCount }}</span>
        </div>
        <div class="stat-foot"><span class="muted">on Steam</span></div>
      </div>

      <div class="pcard stat">
        <div class="stat-icon"><PixelIcon kind="fire" :size="22" color="var(--xp)" /></div>
        <div class="stat-label">GAMES PLAYED</div>
        <div class="stat-value">
          <span v-if="loading">—</span>
          <span v-else>{{ playedCount }}</span>
        </div>
        <div class="stat-foot">
          <span class="muted" v-if="!loading">{{ games.length > 0 ? Math.round((playedCount / games.length) * 100) : 0 }}% of library</span>
        </div>
      </div>
    </div>

    <div class="spacer-lg" />

    <!-- Currently playing / last played card -->
    <div v-if="currentGame" class="pcard cp-card">
      <div class="cp-cover">
        <img
          :src="gameHeaderUrl(currentGame.appid)"
          :alt="currentGame.name"
          style="width:100%;height:100%;object-fit:cover"
        />
        <div class="cp-badge">
          <span class="cp-live-dot" /> {{ t('dash.live') }}
        </div>
      </div>
      <div class="cp-meta">
        <div class="cp-label">{{ t('dash.currentlyPlaying') }}</div>
        <div class="cp-game">{{ currentGame.name }}</div>
        <div class="cp-timer">{{ sessionElapsed !== null ? formatHMS(sessionElapsed) : '—' }}</div>
        <div class="cp-foot">{{ formatHours(currentGame.playtime_forever) }} {{ t('dash.hrsTotal') }}</div>
      </div>
    </div>

    <div class="spacer-lg" />

    <!-- Recently Played feed -->
    <div v-if="recent.length > 0" class="pcard">
      <div class="pcard-h">
        <PixelIcon kind="controller" :size="14" color="var(--accent)" />
        <span class="label">{{ t('dash.activity') }}</span>
        <span class="sub">last 2 weeks</span>
      </div>
      <div class="feed">
        <div v-for="game in recent" :key="game.appid" class="feed-row">
          <div class="ico" style="overflow:hidden">
            <img :src="gameHeaderUrl(game.appid)" :alt="game.name" style="width:100%;height:100%;object-fit:cover" />
          </div>
          <div>
            <div class="ftitle">{{ game.name }}</div>
            <div class="fmeta">{{ formatHours(game.playtime_forever) }} total</div>
          </div>
          <div class="dur">
            {{ formatRecent(game.playtime_2weeks) }}
            <small>{{ t('dash.session') }}</small>
          </div>
        </div>
      </div>
    </div>

    <div class="spacer-lg" />

    <!-- Top 3 with tabs -->
    <div class="pcard">
      <div class="pcard-h">
        <PixelIcon kind="trophy" :size="14" color="var(--accent)" />
        <span class="label">{{ t('dash.top3') }}</span>
        <div style="margin-left:auto;display:flex;gap:4px;">
          <button
            v-for="[key, label] in ([['alltime', t('dash.allTime')], ['year', t('dash.thisYear')], ['month', t('dash.thisMonth')]] as [string, string][])"
            :key="key"
            class="mini-tab"
            :class="{ active: top3Tab === key }"
            @click="top3Tab = key as typeof top3Tab; click()"
          >{{ label }}</button>
        </div>
      </div>

      <div v-if="loading" style="padding:40px;text-align:center;color:var(--text-mute)">Loading…</div>

      <div v-else-if="top3Games.length > 0" class="top3-grid">
        <div
          v-for="(game, i) in top3Games"
          :key="game.appid"
          class="top3-card"
          :class="`rank-${i + 1}`"
        >
          <span class="rank-num">#{{ i + 1 }}</span>
          <div class="top3-cover" style="overflow:hidden">
            <img :src="gameHeaderUrl(game.appid)" :alt="game.name" style="width:100%;height:100%;object-fit:cover" />
          </div>
          <div class="top3-name">{{ game.name }}</div>
          <div class="top3-hours">{{ Math.floor(game.playtime_forever / 60) }}<span>h</span></div>
        </div>
      </div>

      <div v-else style="padding:40px;text-align:center;color:var(--text-mute)">No games found.</div>
    </div>

    <div class="spacer-lg" />

    <!-- Player quick glance -->
    <div v-if="player" class="pcard" style="padding:20px;display:flex;align-items:center;gap:18px;">
      <img
        :src="player.avatarfull"
        :alt="player.personaname"
        style="width:64px;height:64px;border:2px solid var(--accent);flex-shrink:0;"
      />
      <div style="flex:1;min-width:0">
        <div style="font-family:var(--pixel);font-size:11px;color:var(--text);margin-bottom:6px;">{{ player.personaname }}</div>
        <div style="font-size:12px;color:var(--text-dim);display:flex;gap:14px;flex-wrap:wrap;">
          <span><span style="color:var(--good)">●</span> {{ t('common.online') }}</span>
          <span v-if="player.loccountrycode">{{ player.loccountrycode }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
