<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import PixelIcon from '@/components/shared/PixelIcon.vue'
import InfoTip from '@/components/shared/InfoTip.vue'
import { getOwnedGames, getFriends, getRecentlyPlayedGames, getStoreGenres, getBadges, getPlayerAchievements, getAchievementRarities } from '@/services/steamApi'
import { usePlayerSummary } from '@/composables/usePlayerSummary'
import { useI18n } from '@/composables/useI18n'
import { useSound } from '@/composables/useSound'
import type { SteamBadge, SteamOwnedGame, SteamRecentGame } from '@/types/steam'

const { player } = usePlayerSummary()
const { t } = useI18n()
const { click } = useSound()

const games = ref<SteamOwnedGame[]>([])
const recent = ref<SteamRecentGame[]>([])
const badges = ref<SteamBadge[]>([])
const friendsCount = ref<number | null>(null)
const loading = ref(true)
const realGenreMap = ref<Map<string, { hours: number; topGame: string }> | null>(null)

interface RarestAch { name: string; game: string; pct: number }
const rarestAch = ref<RarestAch | null>(null)

onMounted(async () => {
  const [g, f, r, b] = await Promise.allSettled([
    getOwnedGames(), getFriends(), getRecentlyPlayedGames(), getBadges(),
  ])
  if (g.status === 'fulfilled') games.value = g.value
  if (f.status === 'fulfilled') friendsCount.value = f.value.length
  if (r.status === 'fulfilled') recent.value = r.value
  if (b.status === 'fulfilled') badges.value = b.value
  loading.value = false

  // Background: find rarest unlocked achievement across up to 3 recent games
  if (r.status === 'fulfilled' && r.value.length) {
    const gameIds = r.value.slice(0, 3).map(g => ({ appid: g.appid, name: g.name }))
    Promise.all(
      gameIds.map(async ({ appid, name }) => {
        const [achs, rarities] = await Promise.all([getPlayerAchievements(appid), getAchievementRarities(appid)])
        let best: RarestAch | null = null
        for (const ach of achs) {
          if (ach.achieved !== 1) continue
          const pct = Number(rarities[ach.apiname] ?? 100)
          if (!best || pct < best.pct) best = { name: ach.name ?? ach.apiname, game: name, pct }
        }
        return best
      })
    ).then(results => {
      const winner = results.reduce<RarestAch | null>((best, cur) => {
        if (!cur) return best
        if (!best || cur.pct < best.pct) return cur
        return best
      }, null)
      if (winner) rarestAch.value = winner
    }).catch(() => {})
  }

  // Background: fetch genres for top 15 played games via server-side proxy
  if (g.status === 'fulfilled' && g.value.length > 0) {
    const top15 = [...g.value].sort((a, b) => b.playtime_forever - a.playtime_forever).slice(0, 15)
    Promise.all(top15.map(async game => ({ game, genres: await getStoreGenres(game.appid) }))).then(results => {
      const map = new Map<string, { hours: number; topGame: string; topHrs: number }>()
      for (const { game, genres } of results) {
        const hrs = Math.floor(game.playtime_forever / 60)
        for (const genre of genres) {
          const ex = map.get(genre)
          if (!ex) {
            map.set(genre, { hours: hrs, topGame: game.name, topHrs: hrs })
          } else {
            map.set(genre, {
              hours: ex.hours + hrs,
              topGame: hrs > ex.topHrs ? game.name : ex.topGame,
              topHrs: Math.max(ex.topHrs, hrs),
            })
          }
        }
      }
      if (map.size > 0) {
        realGenreMap.value = new Map([...map.entries()].map(([k, v]) => [k, { hours: v.hours, topGame: v.topGame }]))
      }
    }).catch(() => {})
  }
})

const totalHours = computed(() => Math.floor(games.value.reduce((s, g) => s + g.playtime_forever, 0) / 60))
const playedCount = computed(() => games.value.filter(g => g.playtime_forever > 0).length)
const weeklyAvgHrs = computed(() => {
  const twoWeekMins = recent.value.reduce((s, g) => s + g.playtime_2weeks, 0)
  return ((twoWeekMins / 60) / 14 * 7).toFixed(1)
})
const topGames = computed(() => [...games.value].sort((a, b) => b.playtime_forever - a.playtime_forever).slice(0, 3))

const top3Tab = ref<'month' | 'year' | 'alltime'>('alltime')
const top3Games = computed(() => {
  if (top3Tab.value === 'alltime') return topGames.value
  return recent.value.slice(0, 3).map(r => games.value.find(g => g.appid === r.appid) ?? { appid: r.appid, name: r.name, playtime_forever: r.playtime_forever })
})

const nowMs = ref(Date.now())
let timerInterval: ReturnType<typeof setInterval> | null = null
onMounted(() => { timerInterval = setInterval(() => { nowMs.value = Date.now() }, 1000) })
onUnmounted(() => { if (timerInterval) clearInterval(timerInterval) })

const isLive = computed(() => !!player.value?.gameid)
const liveGameId = computed(() => player.value?.gameid ? Number(player.value.gameid) : null)
const liveGameName = computed(() => player.value?.gameextrainfo ?? '')
const lastPlayedGame = computed(() => recent.value[0] ?? null)

const sessionStartMs = computed(() => Number(localStorage.getItem('sf-last-sync') ?? Date.now()))
const sessionElapsed = computed(() => Math.max(0, Math.floor((nowMs.value - sessionStartMs.value) / 1000)))

const GENRE_COLORS = ['var(--accent)', 'var(--xp)', 'var(--rare)', 'var(--good)', 'var(--bad)']
const genreData = computed(() => {
  if (totalHours.value === 0) return []
  if (realGenreMap.value && realGenreMap.value.size > 0) {
    return [...realGenreMap.value.entries()]
      .sort(([, a], [, b]) => b.hours - a.hours)
      .slice(0, 5)
      .map(([name, { hours, topGame }], i) => ({
        name,
        hours,
        topGame: topGame.length > 16 ? topGame.slice(0, 15) + '…' : topGame,
        color: GENRE_COLORS[i]!,
      }))
  }
  return [{ name: '…', hours: totalHours.value, topGame: '', color: GENRE_COLORS[0]! }]
})
const genreTotal = computed(() => genreData.value.reduce((s, g) => s + g.hours, 0))

const donutSegments = computed(() => {
  if (genreData.value.length === 0) return []
  const r = 72, cx = 90, cy = 90
  // Single segment fills 360° — SVG arc is degenerate when start==end, use two semicircles
  if (genreData.value.length === 1) {
    const g = genreData.value[0]!
    return [{ ...g, d: `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z` }]
  }
  let angle = 0
  return genreData.value.map(g => {
    const pct = g.hours / genreTotal.value
    const startAngle = angle
    angle += pct * 360
    const large = pct > 0.5 ? 1 : 0
    const toRad = (a: number) => (a - 90) * Math.PI / 180
    const x1 = cx + r * Math.cos(toRad(startAngle))
    const y1 = cy + r * Math.sin(toRad(startAngle))
    const x2 = cx + r * Math.cos(toRad(angle))
    const y2 = cy + r * Math.sin(toRad(angle))
    return { ...g, d: `M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z` }
  })
})

// Real recently-played bars from playtime_2weeks data
const recentBars = computed(() => {
  if (!recent.value.length) return []
  const maxMins = Math.max(...recent.value.map(g => g.playtime_2weeks), 1)
  return recent.value.slice(0, 7).map(g => ({
    name: g.name.length > 9 ? g.name.slice(0, 8) + '…' : g.name,
    h: parseFloat((g.playtime_2weeks / 60).toFixed(1)),
    pct: g.playtime_2weeks / maxMins * 100,
  }))
})
const maxRecentBar = computed(() => Math.max(...recentBars.value.map(b => b.h), 1))

const dlcEstimate = computed(() => Math.round(games.value.length * 0.25))
const dlcTotal = computed(() => games.value.length + dlcEstimate.value)

const totalBadgeXp = computed(() => badges.value.reduce((s, b) => s + b.xp, 0))
const gameBadgeCount = computed(() => badges.value.filter(b => !!b.appid).length)

const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })

function gameHeaderUrl(appId: number) { return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg` }
function libraryUrl(appId: number) { return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/library_600x900.jpg` }
function formatHours(mins: number) { return `${Math.floor(mins / 60)}h` }
function formatRecent(mins2weeks: number) { const h = Math.floor(mins2weeks / 60); return h > 0 ? `${h}h ${mins2weeks % 60}m` : `${mins2weeks % 60}m` }
function formatHMS(s: number) { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60; return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` }
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
        <div class="stat-label" style="display:inline-flex;align-items:center">
          {{ t('dash.gamesOwned') }}
          <InfoTip :content="t('tip.gamesOwned')" />
        </div>
        <div class="stat-value"><span v-if="loading">—</span><span v-else>{{ games.length }}</span></div>
        <div class="stat-foot"><span class="muted">{{ playedCount }} {{ t('common.played') }}</span></div>
      </div>
      <div class="pcard stat">
        <div class="stat-icon"><PixelIcon kind="clock" :size="22" color="var(--accent)" /></div>
        <div class="stat-label" style="display:inline-flex;align-items:center">
          {{ t('dash.totalHours') }}
          <InfoTip :content="t('tip.totalHours')" />
        </div>
        <div class="stat-value">
          <span v-if="loading">—</span>
          <template v-else>{{ totalHours.toLocaleString() }}<span class="unit">{{ t('common.hrs') }}</span></template>
        </div>
        <div class="stat-foot"><span class="muted">{{ t('dash.acrossAll') }}</span></div>
      </div>
      <div class="pcard stat">
        <div class="stat-icon"><PixelIcon kind="fire" :size="22" color="var(--xp)" /></div>
        <div class="stat-label" style="display:inline-flex;align-items:center">
          {{ t('dash.weeklyAvg') }}
          <InfoTip :content="t('tip.weeklyAvg')" />
        </div>
        <div class="stat-value">
          <span v-if="loading">—</span>
          <template v-else>{{ weeklyAvgHrs }}<span class="unit">{{ t('common.hrsWk') }}</span></template>
        </div>
        <div class="stat-foot"><span class="muted">{{ t('dash.thisWeek') }}</span></div>
      </div>
      <div class="pcard stat">
        <div class="stat-icon"><PixelIcon kind="plus" :size="22" color="var(--accent)" /></div>
        <div class="stat-label" style="display:inline-flex;align-items:center">
          {{ t('dash.dlcOwned') }}
          <InfoTip :content="t('tip.dlcOwned')" />
        </div>
        <div class="stat-value"><span v-if="loading">—</span><span v-else>{{ dlcEstimate }}</span></div>
        <div class="stat-foot"><span class="muted">{{ t('dash.estAddons') }}</span></div>
      </div>
    </div>

    <div class="spacer-lg" />

    <!-- Currently playing (LIVE) -->
    <div v-if="isLive" class="pcard cp-card">
      <div class="cp-cover">
        <img :src="gameHeaderUrl(liveGameId ?? 0)" :alt="liveGameName" style="width:100%;height:100%;object-fit:cover" />
        <div class="cp-badge"><span class="cp-live-dot" /> {{ t('dash.live') }}</div>
      </div>
      <div class="cp-meta">
        <div class="cp-label">{{ t('dash.currentlyPlaying') }}</div>
        <div class="cp-game">{{ liveGameName }}</div>
        <div class="cp-timer">{{ formatHMS(sessionElapsed) }}</div>
        <div class="cp-foot">{{ t('dash.session') }}</div>
      </div>
    </div>

    <!-- Last played (when not in a game) -->
    <div v-else-if="lastPlayedGame" class="pcard cp-card">
      <div class="cp-cover">
        <img :src="gameHeaderUrl(lastPlayedGame.appid)" :alt="lastPlayedGame.name" style="width:100%;height:100%;object-fit:cover" />
        <div class="cp-badge cp-badge-paused">{{ t('dash.lastPlayed') }}</div>
      </div>
      <div class="cp-meta">
        <div class="cp-label">{{ t('dash.lastPlayed') }}</div>
        <div class="cp-game">{{ lastPlayedGame.name }}</div>
        <div class="cp-timer">{{ formatHours(lastPlayedGame.playtime_2weeks) }}<span style="font-size:14px;color:var(--text-mute)"> · {{ t('dash.last2weeks') }}</span></div>
        <div class="cp-foot">{{ formatHours(lastPlayedGame.playtime_forever) }} {{ t('dash.hrsTotal') }}</div>
      </div>
    </div>

    <div class="spacer-lg" />

    <!-- Genre Donut + Weekly Bars -->
    <div class="grid split">
      <!-- Genre donut -->
      <div class="pcard">
        <div class="pcard-h">
          <PixelIcon kind="chart" :size="14" color="var(--accent)" />
          <span class="label">{{ t('dash.genres') }}</span>
          <span class="sub">top 15 {{ t('lib.totalGames').toLowerCase() }}</span>
        </div>
        <div class="donut-wrap">
          <div class="donut">
            <svg width="180" height="180" viewBox="0 0 180 180">
              <path v-for="seg in donutSegments" :key="seg.name" :d="seg.d" :fill="seg.color" opacity="0.9" />
              <circle cx="90" cy="90" r="48" fill="var(--bg-navy)" />
            </svg>
            <div class="center">
              <div class="big">{{ genreData[0]?.name ?? '—' }}</div>
              <div class="small">{{ genreData[0] ? Math.round(genreData[0].hours / genreTotal * 100) : 0 }}%</div>
            </div>
          </div>
          <div class="legend">
            <div v-for="g in genreData" :key="g.name" class="row">
              <div class="swatch" :style="{ background: g.color }" />
              <div style="display:flex;flex-direction:column;min-width:0">
                <span style="font-size:12px">{{ g.name }}</span>
                <span style="font-size:10px;color:var(--text-mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ g.topGame }}</span>
              </div>
              <span class="hrs">{{ Math.round(g.hours / genreTotal * 100) }}%</span>
            </div>
          </div>
        </div>
        <div v-if="genreData[0]" style="padding:12px 18px 18px;border-top:1px solid var(--line-soft);display:flex;justify-content:space-between;align-items:center;font-family:var(--mono);font-size:11px;color:var(--text-mute)">
          <span>{{ t('dash.leader') }} → <span style="color:var(--accent)">{{ genreData[0].name }}</span></span>
          <span>{{ Math.round(genreData[0].hours / genreTotal * 100) }}% · {{ genreData[0].topGame }}</span>
        </div>
      </div>

      <!-- Recently played bars (real playtime_2weeks data) -->
      <div class="pcard">
        <div class="pcard-h">
          <PixelIcon kind="clock" :size="14" color="var(--accent)" />
          <span class="label">{{ t('dash.recentlyPlayed') }}</span>
          <span class="sub">{{ t('dash.last2weeks') }}</span>
        </div>
        <div v-if="!recentBars.length" style="padding:20px;color:var(--text-mute);text-align:center;font-family:var(--pixel);font-size:9px">
          {{ t('common.loading') }}
        </div>
        <div v-else class="bars">
          <div v-for="b in recentBars" :key="b.name" class="bar-col">
            <div class="val">{{ b.h }}h</div>
            <div class="bar-stack">
              <div
                class="bar"
                :class="{ hi: b.h === maxRecentBar, lo: b.h < maxRecentBar * 0.3 }"
                :style="{ height: `${(b.h / maxRecentBar) * 100}%`, minHeight: '4px' }"
              />
            </div>
            <div class="label" :style="{ color: b.h === maxRecentBar ? 'var(--accent)' : undefined }">{{ b.name }}</div>
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
        <div style="margin-left:auto;display:flex;gap:4px">
          <button
            v-for="([key, label]) in ([['alltime', t('dash.allTime')], ['year', t('dash.thisYear')], ['month', t('dash.thisMonth')]] as [string,string][])"
            :key="key"
            class="mini-tab"
            :class="{ active: top3Tab === key }"
            @click="top3Tab = key as typeof top3Tab; click()"
          >{{ label }}</button>
        </div>
      </div>
      <div v-if="loading" style="padding:40px;text-align:center;color:var(--text-mute)">{{ t('common.loading') }}</div>
      <div v-else-if="top3Games.length" class="top3-grid">
        <a
          v-for="(game, i) in top3Games"
          :key="game.appid"
          class="top3-card"
          :class="`rank-${i + 1}`"
          :href="`https://store.steampowered.com/app/${game.appid}/`"
          target="_blank"
          rel="noopener noreferrer"
          style="text-decoration:none;color:inherit"
        >
          <span class="rank-num">#{{ i + 1 }}</span>
          <div class="top3-cover" style="overflow:hidden">
            <img :src="gameHeaderUrl(game.appid)" :alt="game.name" style="width:100%;height:100%;object-fit:cover" />
          </div>
          <div class="top3-name">{{ game.name }}</div>
          <div class="top3-hours">{{ Math.floor(game.playtime_forever / 60) }}<span>h</span></div>
        </a>
      </div>
    </div>

    <div class="spacer-lg" />

    <!-- DLC Pie + Achievement gauge -->
    <div class="grid split">
      <!-- DLC Pie -->
      <div class="pcard">
        <div class="pcard-h">
          <PixelIcon kind="plus" :size="14" color="var(--accent)" />
          <span class="label" style="display:inline-flex;align-items:center">
            {{ t('dash.dlcRatio') }}
            <InfoTip :content="t('tip.dlcRatio')" />
          </span>
          <span class="sub">{{ dlcTotal ? (dlcEstimate / games.length).toFixed(2) : '—' }} {{ t('dash.dlcPerGame') }}</span>
        </div>
        <div style="display:grid;grid-template-columns:120px 1fr;gap:18px;align-items:center;padding:16px 20px">
          <div style="width:120px;height:120px;position:relative">
            <div :style="{
              width: '120px', height: '120px', borderRadius: '50%',
              background: dlcTotal ? `conic-gradient(var(--accent) 0deg ${(games.length / dlcTotal) * 360}deg, var(--xp) ${(games.length / dlcTotal) * 360}deg 360deg)` : 'var(--bg-panel)',
            }" />
            <div style="position:absolute;inset:22px;background:var(--bg-navy);border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center">
              <div style="font-family:var(--pixel);font-size:9px;color:var(--accent)">{{ dlcTotal }}</div>
              <div style="font-family:var(--mono);font-size:9px;color:var(--text-mute);margin-top:4px">{{ t('common.items') }}</div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px">
            <div class="dlc-row">
              <span class="dlc-sw" style="background:var(--accent)" />
              <span>{{ t('dash.games') }}</span>
              <span class="dlc-v">{{ games.length }}</span>
              <span class="dlc-p">{{ dlcTotal ? Math.round((games.length / dlcTotal) * 100) : 0 }}%</span>
            </div>
            <div class="dlc-row">
              <span class="dlc-sw" style="background:var(--xp)" />
              <span>DLC</span>
              <span class="dlc-v">{{ dlcEstimate }}</span>
              <span class="dlc-p">{{ dlcTotal ? Math.round((dlcEstimate / dlcTotal) * 100) : 0 }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Badge stats + achievements link -->
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="pcard">
          <div class="pcard-h">
            <PixelIcon kind="trophy" :size="14" color="var(--accent)" />
            <span class="label">{{ t('nav.achievements').toUpperCase() }}</span>
            <span class="sub">{{ badges.length }} {{ t('dash.badgesEarned') }}</span>
          </div>
          <div style="padding:16px 20px 20px;display:flex;flex-direction:column;gap:16px">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div>
                <div style="font-family:var(--pixel);font-size:18px;color:var(--xp)">{{ totalBadgeXp.toLocaleString() }}</div>
                <div style="font-family:var(--mono);font-size:10px;color:var(--text-mute);margin-top:4px">{{ t('dash.totalXp') }}</div>
              </div>
              <div>
                <div style="font-family:var(--pixel);font-size:18px;color:var(--accent)">{{ gameBadgeCount }}</div>
                <div style="font-family:var(--mono);font-size:10px;color:var(--text-mute);margin-top:4px">{{ t('dash.gameBadges') }}</div>
              </div>
            </div>
            <router-link
              to="/achievements"
              style="font-family:var(--pixel);font-size:8px;color:var(--accent);padding:8px 14px;border:1px solid var(--accent-dim);letter-spacing:1px;text-decoration:none;align-self:flex-start"
            >{{ t('nav.achievements').toUpperCase() }} →</router-link>
          </div>
        </div>

        <!-- Rarest achievement -->
        <div class="pcard rare-card">
          <div class="rare-icon">
            <div style="position:absolute;inset:8px;background:radial-gradient(circle,var(--rare) 0%,var(--rare-dim) 60%,transparent 100%)" />
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">
              <PixelIcon kind="star" :size="32" color="#fff" />
            </div>
          </div>
          <div>
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-family:var(--pixel);font-size:7px;color:var(--rare);letter-spacing:1px;padding:3px 6px;border:1px solid var(--rare-dim)">
                {{ t('dash.rarest') }}
              </span>
            </div>
            <template v-if="rarestAch">
              <div class="rtitle" style="margin-top:8px">{{ rarestAch.name }}</div>
              <div class="rmeta" style="margin-top:6px">
                <span class="rgame">{{ rarestAch.game }}</span>
                · {{ rarestAch.pct.toFixed(1) }}%
              </div>
            </template>
            <div v-else class="rtitle" style="margin-top:8px;color:var(--text-mute);font-size:9px">{{ t('common.loading') }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="spacer-lg" />

    <!-- Recent activity feed (full width) -->
    <div v-if="recent.length" class="pcard">
      <div class="pcard-h">
        <PixelIcon kind="controller" :size="14" color="var(--accent)" />
        <span class="label">{{ t('dash.activity') }}</span>
        <span class="sub">{{ t('dash.last2weeks') }}</span>
      </div>
      <div class="feed">
        <a
          v-for="game in recent"
          :key="game.appid"
          class="feed-row"
          :href="`https://store.steampowered.com/app/${game.appid}/`"
          target="_blank"
          rel="noopener noreferrer"
          style="text-decoration:none;color:inherit"
        >
          <div class="ico" style="overflow:hidden">
            <img
              :src="libraryUrl(game.appid)"
              :alt="game.name"
              style="width:100%;height:100%;object-fit:cover"
              @error="($event.target as HTMLImageElement).src = gameHeaderUrl(game.appid)"
            />
          </div>
          <div>
            <div class="ftitle">{{ game.name }}</div>
            <div class="fmeta">{{ formatHours(game.playtime_forever) }} {{ t('common.total') }}</div>
          </div>
          <div class="dur">{{ formatRecent(game.playtime_2weeks) }}<small>{{ t('dash.session') }}</small></div>
        </a>
      </div>
    </div>

    <div class="spacer-lg" />

    <!-- Player quick glance -->
    <div v-if="player" class="pcard" style="padding:20px;display:flex;align-items:center;gap:18px">
      <img :src="player.avatarfull" :alt="player.personaname" style="width:64px;height:64px;border:2px solid var(--accent);flex-shrink:0" />
      <div style="flex:1;min-width:0">
        <div style="font-family:var(--pixel);font-size:11px;color:var(--text);margin-bottom:6px">{{ player.personaname }}</div>
        <div style="font-size:12px;color:var(--text-dim);display:flex;gap:14px;flex-wrap:wrap">
          <span><span style="color:var(--good)">●</span> {{ t('common.online') }}</span>
          <span v-if="player.loccountrycode">{{ player.loccountrycode }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
