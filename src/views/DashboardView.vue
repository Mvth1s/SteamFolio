<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PixelIcon from '@/components/shared/PixelIcon.vue'
import { getOwnedGames, getFriends, getRecentlyPlayedGames } from '@/services/steamApi'
import { usePlayerSummary } from '@/composables/usePlayerSummary'
import { useI18n } from '@/composables/useI18n'
import type { SteamOwnedGame, SteamRecentGame } from '@/types/steam'

const { player } = usePlayerSummary()
const { t } = useI18n()

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

const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })

function gameHeaderUrl(appId: number) {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`
}

function formatHours(minutes: number): string {
  return `${(minutes / 60).toFixed(0)}h`
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

    <div class="grid stats">
      <div class="pcard stat">
        <div class="stat-icon">
          <PixelIcon kind="library" :size="22" color="var(--accent)" />
        </div>
        <div class="stat-label">{{ t('dash.gamesOwned') }}</div>
        <div class="stat-value">
          <span v-if="loading">—</span>
          <span v-else>{{ games.length }}</span>
        </div>
        <div class="stat-foot">
          <span class="muted">{{ playedCount }} played</span>
        </div>
      </div>

      <div class="pcard stat">
        <div class="stat-icon">
          <PixelIcon kind="clock" :size="22" color="var(--accent)" />
        </div>
        <div class="stat-label">{{ t('dash.totalHours') }}</div>
        <div class="stat-value">
          <span v-if="loading">—</span>
          <template v-else>{{ totalHours.toLocaleString() }}<span class="unit">hrs</span></template>
        </div>
        <div class="stat-foot">
          <span class="muted">across all games</span>
        </div>
      </div>

      <div class="pcard stat">
        <div class="stat-icon">
          <PixelIcon kind="friends" :size="22" color="var(--accent)" />
        </div>
        <div class="stat-label">FRIENDS</div>
        <div class="stat-value">
          <span v-if="friendsCount === null">—</span>
          <span v-else>{{ friendsCount }}</span>
        </div>
        <div class="stat-foot">
          <span class="muted">on Steam</span>
        </div>
      </div>

      <div class="pcard stat">
        <div class="stat-icon">
          <PixelIcon kind="fire" :size="22" color="var(--xp)" />
        </div>
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

    <!-- Recently Played -->
    <div v-if="recent.length > 0" class="pcard">
      <div class="pcard-h">
        <PixelIcon kind="controller" :size="14" color="var(--accent)" />
        <span class="label">{{ t('dash.activity') }}</span>
        <span class="sub">last 2 weeks</span>
      </div>
      <div class="feed">
        <div
          v-for="game in recent"
          :key="game.appid"
          class="feed-row"
        >
          <div class="ico" style="overflow:hidden">
            <img
              :src="gameHeaderUrl(game.appid)"
              :alt="game.name"
              style="width:100%;height:100%;object-fit:cover"
            />
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

    <!-- Top 3 All Time -->
    <div class="section-h">
      <h2>TOP GAMES · ALL TIME</h2>
      <span class="meta">by playtime</span>
    </div>

    <div v-if="loading" class="pcard" style="padding:40px;text-align:center;color:var(--text-mute)">
      Loading…
    </div>

    <div v-else-if="topGames.length > 0" class="top3-grid">
      <div
        v-for="(game, i) in topGames"
        :key="game.appid"
        class="top3-card"
        :class="`rank-${i + 1}`"
      >
        <span class="rank-num">#{{ i + 1 }}</span>
        <div class="top3-cover" style="overflow:hidden">
          <img
            :src="gameHeaderUrl(game.appid)"
            :alt="game.name"
            style="width:100%;height:100%;object-fit:cover"
          />
        </div>
        <div class="top3-name">{{ game.name }}</div>
        <div class="top3-hours">
          {{ Math.floor(game.playtime_forever / 60) }}<span>h</span>
        </div>
      </div>
    </div>

    <div v-else class="pcard" style="padding:40px;text-align:center;color:var(--text-mute)">
      No games found.
    </div>

    <div class="spacer-lg" />

    <!-- Profile quick glance -->
    <div v-if="player" class="pcard" style="padding:20px;display:flex;align-items:center;gap:18px;">
      <img
        :src="player.avatarfull"
        :alt="player.personaname"
        style="width:64px;height:64px;border:2px solid var(--accent);flex-shrink:0;"
      />
      <div style="flex:1;min-width:0">
        <div style="font-family:var(--pixel);font-size:11px;color:var(--text);margin-bottom:6px;">
          {{ player.personaname }}
        </div>
        <div style="font-size:12px;color:var(--text-dim);display:flex;gap:14px;flex-wrap:wrap;">
          <span><span style="color:var(--good)">●</span> {{ t('common.online') }}</span>
          <span v-if="player.loccountrycode">{{ player.loccountrycode }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
