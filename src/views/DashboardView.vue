<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import PixelIcon from '@/components/shared/PixelIcon.vue'
import InfoTip from '@/components/shared/InfoTip.vue'
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
  const [g, f, r] = await Promise.allSettled([getOwnedGames(), getFriends(), getRecentlyPlayedGames()])
  if (g.status === 'fulfilled') games.value = g.value
  if (f.status === 'fulfilled') friendsCount.value = f.value.length
  if (r.status === 'fulfilled') recent.value = r.value
  loading.value = false
})

const totalHours = computed(() => Math.floor(games.value.reduce((s, g) => s + g.playtime_forever, 0) / 60))
const playedCount = computed(() => games.value.filter(g => g.playtime_forever > 0).length)
const weeklyAvgHrs = computed(() => {
  const twoWeekMins = recent.value.reduce((s, g) => s + g.playtime_2weeks, 0)
  return ((twoWeekMins / 60) / 14 * 7).toFixed(1)
})
const topGames = computed(() => [...games.value].sort((a, b) => b.playtime_forever - a.playtime_forever).slice(0, 3))

// Top3 tabs
const top3Tab = ref<'month' | 'year' | 'alltime'>('alltime')
const top3Games = computed(() => {
  if (top3Tab.value === 'alltime') return topGames.value
  return recent.value.slice(0, 3).map(r => games.value.find(g => g.appid === r.appid) ?? { appid: r.appid, name: r.name, playtime_forever: r.playtime_forever })
})

// Currently playing live timer
const nowMs = ref(Date.now())
let timerInterval: ReturnType<typeof setInterval> | null = null
onMounted(() => { timerInterval = setInterval(() => { nowMs.value = Date.now() }, 1000) })
onUnmounted(() => { if (timerInterval) clearInterval(timerInterval) })
const currentGame = computed(() => recent.value[0] ?? null)
const sessionStartMs = computed(() => Number(localStorage.getItem('sf-last-sync') ?? Date.now()))
const sessionElapsed = computed(() => Math.max(0, Math.floor((nowMs.value - sessionStartMs.value) / 1000)))

// ——— MOCK: genre donut (seeded from total hours to look plausible) ———
const GENRE_COLORS = ['var(--accent)', 'var(--xp)', 'var(--rare)', 'var(--good)', 'var(--bad)']
const GENRE_NAMES = ['RPG', 'Action', 'Strategy', 'Indie', 'Adventure']
const genreData = computed(() => {
  if (totalHours.value === 0) return []
  const base = totalHours.value
  const weights = [0.38, 0.27, 0.18, 0.11, 0.06]
  return GENRE_NAMES.map((name, i) => ({
    name,
    hours: Math.round(base * weights[i]!),
    color: GENRE_COLORS[i]!,
  }))
})
const genreTotal = computed(() => genreData.value.reduce((s, g) => s + g.hours, 0))

// Donut SVG helpers (conic-gradient approach)
const donutSegments = computed(() => {
  let angle = 0
  const r = 72, cx = 90, cy = 90
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

// ——— MOCK: weekly bars (derived from playtime_2weeks, spread over 7 days) ———
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const weeklyBars = computed(() => {
  const total2w = recent.value.reduce((s, g) => s + g.playtime_2weeks, 0) / 60
  const baseHrs = total2w / 2
  const weights = [0.08, 0.12, 0.10, 0.15, 0.18, 0.22, 0.15]
  return DAYS.map((d, i) => ({ d, h: parseFloat((baseHrs * weights[i]!).toFixed(1)) }))
})
const maxBar = computed(() => Math.max(...weeklyBars.value.map(w => w.h), 1))

// ——— DLC Pie (games count from API, DLC estimated ~25%) ———
const dlcEstimate = computed(() => Math.round(games.value.length * 0.25))
const dlcTotal = computed(() => games.value.length + dlcEstimate.value)

// ——— Achievement gauge (mock at 28% — realistic for most Steam accounts) ———
const ACH_RATE = 0.284
const ACH_TOTAL_EST = computed(() => Math.round(games.value.length * 8.2))
const ACH_UNLOCKED_EST = computed(() => Math.round(ACH_TOTAL_EST.value * ACH_RATE))

// ——— WorldMap mock friend locations ———
const WORLD_GRID = [
  '..............................',
  '....#####.......#####.........',
  '..############.######....##...',
  '..############.#######...##...',
  '...##########.########.####...',
  '....########..#######..####...',
  '......######....####.......##.',
  '.......####......##...........',
  '........###.......#.....##....',
  '........###.......##....###...',
  '........###........#######....',
  '.........##........######.....',
  '..........#.........####......',
  '............................##',
  '...........................##.',
  '..............................',
]
const FRIEND_PINS = [
  { x: 6, y: 3, label: 'EU · 4 friends' },
  { x: 4, y: 5, label: 'NA · 3 friends' },
  { x: 22, y: 4, label: 'AS · 2 friends' },
]
const hoveredPin = ref<string | null>(null)

const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })

function gameHeaderUrl(appId: number) { return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg` }
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
        <div class="stat-foot"><span class="muted">{{ playedCount }} played</span></div>
      </div>
      <div class="pcard stat">
        <div class="stat-icon"><PixelIcon kind="clock" :size="22" color="var(--accent)" /></div>
        <div class="stat-label" style="display:inline-flex;align-items:center">
          {{ t('dash.totalHours') }}
          <InfoTip :content="t('tip.totalHours')" />
        </div>
        <div class="stat-value">
          <span v-if="loading">—</span>
          <template v-else>{{ totalHours.toLocaleString() }}<span class="unit">hrs</span></template>
        </div>
        <div class="stat-foot"><span class="muted">across all games</span></div>
      </div>
      <div class="pcard stat">
        <div class="stat-icon"><PixelIcon kind="fire" :size="22" color="var(--xp)" /></div>
        <div class="stat-label" style="display:inline-flex;align-items:center">
          {{ t('dash.weeklyAvg') }}
          <InfoTip :content="t('tip.weeklyAvg')" />
        </div>
        <div class="stat-value">
          <span v-if="loading">—</span>
          <template v-else>{{ weeklyAvgHrs }}<span class="unit">hrs/wk</span></template>
        </div>
        <div class="stat-foot"><span class="muted">{{ t('dash.thisWeek') }}</span></div>
      </div>
      <div class="pcard stat">
        <div class="stat-icon"><PixelIcon kind="friends" :size="22" color="var(--accent)" /></div>
        <div class="stat-label">FRIENDS</div>
        <div class="stat-value"><span v-if="friendsCount === null">—</span><span v-else>{{ friendsCount }}</span></div>
        <div class="stat-foot"><span class="muted">on Steam</span></div>
      </div>
    </div>

    <div class="spacer-lg" />

    <!-- Currently playing -->
    <div v-if="currentGame" class="pcard cp-card">
      <div class="cp-cover">
        <img :src="gameHeaderUrl(currentGame.appid)" :alt="currentGame.name" style="width:100%;height:100%;object-fit:cover" />
        <div class="cp-badge"><span class="cp-live-dot" /> {{ t('dash.live') }}</div>
      </div>
      <div class="cp-meta">
        <div class="cp-label">{{ t('dash.currentlyPlaying') }}</div>
        <div class="cp-game">{{ currentGame.name }}</div>
        <div class="cp-timer">{{ formatHMS(sessionElapsed) }}</div>
        <div class="cp-foot">{{ formatHours(currentGame.playtime_forever) }} {{ t('dash.hrsTotal') }}</div>
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
          <span class="sub">{{ genreTotal.toLocaleString() }} {{ t('dash.hrsTotal') }}</span>
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
                <span class="pct">{{ Math.round(g.hours / genreTotal * 100) }}%</span>
              </div>
              <span class="hrs">{{ g.hours }}h</span>
            </div>
          </div>
        </div>
        <div v-if="genreData[0]" style="padding:12px 18px 18px;border-top:1px solid var(--line-soft);display:flex;justify-content:space-between;align-items:center;font-family:var(--mono);font-size:11px;color:var(--text-mute)">
          <span>{{ t('dash.leader') }} → <span style="color:var(--accent)">{{ genreData[0].name }}</span></span>
          <span>{{ genreData[0].hours }}h · {{ Math.round(genreData[0].hours / genreTotal * 100) }}%</span>
        </div>
      </div>

      <!-- Weekly bars -->
      <div class="pcard">
        <div class="pcard-h">
          <PixelIcon kind="clock" :size="14" color="var(--accent)" />
          <span class="label">{{ t('dash.weekly') }}</span>
          <span class="sub">{{ weeklyAvgHrs }} {{ t('dash.hrsPerDay') }}</span>
        </div>
        <div class="bars">
          <div v-for="w in weeklyBars" :key="w.d" class="bar-col">
            <div class="val">{{ w.h }}h</div>
            <div class="bar-stack">
              <div
                class="bar"
                :class="{ hi: w.h === maxBar, lo: w.h < maxBar * 0.3 }"
                :style="{ height: `${(w.h / maxBar) * 100}%`, minHeight: '4px' }"
              />
            </div>
            <div class="label" :style="{ color: w.h === maxBar ? 'var(--accent)' : undefined }">{{ w.d }}</div>
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
      <div v-if="loading" style="padding:40px;text-align:center;color:var(--text-mute)">Loading…</div>
      <div v-else-if="top3Games.length" class="top3-grid">
        <div v-for="(game, i) in top3Games" :key="game.appid" class="top3-card" :class="`rank-${i + 1}`">
          <span class="rank-num">#{{ i + 1 }}</span>
          <div class="top3-cover" style="overflow:hidden">
            <img :src="gameHeaderUrl(game.appid)" :alt="game.name" style="width:100%;height:100%;object-fit:cover" />
          </div>
          <div class="top3-name">{{ game.name }}</div>
          <div class="top3-hours">{{ Math.floor(game.playtime_forever / 60) }}<span>h</span></div>
        </div>
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
          <span class="sub">{{ dlcTotal ? (dlcEstimate / games.length).toFixed(2) : '—' }} dlc/game</span>
        </div>
        <div style="display:grid;grid-template-columns:120px 1fr;gap:18px;align-items:center;padding:16px 20px">
          <div style="width:120px;height:120px;position:relative">
            <div :style="{
              width: '120px', height: '120px', borderRadius: '50%',
              background: dlcTotal ? `conic-gradient(var(--accent) 0deg ${(games.length / dlcTotal) * 360}deg, var(--xp) ${(games.length / dlcTotal) * 360}deg 360deg)` : 'var(--bg-panel)',
            }" />
            <div style="position:absolute;inset:22px;background:var(--bg-navy);border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center">
              <div style="font-family:var(--pixel);font-size:9px;color:var(--accent)">{{ dlcTotal }}</div>
              <div style="font-family:var(--mono);font-size:9px;color:var(--text-mute);margin-top:4px">items</div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px">
            <div class="dlc-row">
              <span class="dlc-sw" style="background:var(--accent)" />
              <span>Games</span>
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

      <!-- Achievement gauge -->
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="pcard">
          <div class="pcard-h">
            <PixelIcon kind="trophy" :size="14" color="var(--accent)" />
            <span class="label" style="display:inline-flex;align-items:center">
              {{ t('dash.achRate') }}
              <InfoTip :content="t('tip.achRate')" />
            </span>
            <span class="sub">~{{ ACH_UNLOCKED_EST.toLocaleString() }} / {{ ACH_TOTAL_EST.toLocaleString() }}</span>
          </div>
          <div class="gauge">
            <div class="gauge-arc" :style="{
              background: `conic-gradient(from 270deg, var(--accent) 0deg ${ACH_RATE * 180}deg, var(--bg-panel) ${ACH_RATE * 180}deg 180deg, transparent 180deg)`
            }">
              <div class="gauge-inner">
                <div class="gauge-val">{{ (ACH_RATE * 100).toFixed(1) }}<span>%</span></div>
                <div class="gauge-sub">{{ t('dash.global') }}</div>
              </div>
            </div>
            <div class="gauge-label">{{ t('dash.nextMilestone') }}</div>
          </div>
          <div style="padding:0 20px 18px">
            <div class="pbar"><i :style="{ width: `${ACH_RATE * 100}%` }" /></div>
            <div class="spread" style="margin-top:12px;font-size:11px;color:var(--text-mute);font-family:var(--mono)">
              <span>{{ t('dash.nextMilestone') }}</span>
              <span>{{ Math.round((0.40 - ACH_RATE) * ACH_TOTAL_EST) }} {{ t('dash.toGo') }}</span>
            </div>
          </div>
        </div>

        <!-- Rarest achievement placeholder card -->
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
            <div class="rtitle" style="margin-top:8px">— · check Achievements tab</div>
            <div class="rmeta">{{ t('dash.achRate') }} · {{ (ACH_RATE * 100).toFixed(1) }}%</div>
          </div>
        </div>
      </div>
    </div>

    <div class="spacer-lg" />

    <!-- World Map + Recent Activity -->
    <div class="grid split">
      <!-- World map -->
      <div class="pcard">
        <div class="pcard-h">
          <PixelIcon kind="friends" :size="14" color="var(--accent)" />
          <span class="label">{{ t('dash.worldmap') }}</span>
          <span class="sub">{{ friendsCount ?? '…' }} {{ t('friends.total') }}</span>
        </div>
        <div class="worldmap-wrap">
          <div
            class="worldmap"
            :style="`grid-template-columns:repeat(30,1fr);grid-template-rows:repeat(16,1fr)`"
          >
            <template v-for="(row, y) in WORLD_GRID" :key="y">
              <div
                v-for="(cell, x) in row.split('')"
                :key="`${x}-${y}`"
                class="wm-cell"
                :class="cell === '#' ? 'land' : 'sea'"
              />
            </template>
            <div
              v-for="pin in FRIEND_PINS"
              :key="pin.label"
              class="wm-pin"
              :class="{ hot: hoveredPin === pin.label }"
              :style="`left:${(pin.x / 30) * 100}%;top:${(pin.y / 16) * 100}%`"
              @mouseenter="hoveredPin = pin.label"
              @mouseleave="hoveredPin = null"
            >
              <span class="wm-dot" />
              <span class="wm-ring" />
              <span v-if="hoveredPin === pin.label" class="wm-label">{{ pin.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent activity feed -->
      <div v-if="recent.length" class="pcard">
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
            <div class="dur">{{ formatRecent(game.playtime_2weeks) }}<small>{{ t('dash.session') }}</small></div>
          </div>
        </div>
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
