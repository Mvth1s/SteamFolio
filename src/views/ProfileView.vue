<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getSteamLevel, getOwnedGames, getFriends, getBadges } from '@/services/steamApi'
import type { SteamBadge } from '@/types/steam'
import { usePlayerSummary } from '@/composables/usePlayerSummary'
import { useI18n } from '@/composables/useI18n'
import { formatUnixDate, getStatusLabel } from '@/utils/steamFormatters'
import PixelIcon from '@/components/shared/PixelIcon.vue'
import type { SteamOwnedGame } from '@/types/steam'

const { player, loading, error } = usePlayerSummary()
const { t } = useI18n()

const steamLevel = ref<number | null>(null)
const allGames = ref<SteamOwnedGame[]>([])
const friendsCount = ref<number | null>(null)
const badges = ref<SteamBadge[]>([])

const totalHours = computed(() => Math.floor(allGames.value.reduce((s, g) => s + g.playtime_forever, 0) / 60))
const showcaseGames = computed(() => [...allGames.value].sort((a, b) => b.playtime_forever - a.playtime_forever).slice(0, 5))

const playedGames = computed(() => allGames.value.filter(g => g.playtime_forever > 0))
const avgSessionHrs = computed(() => {
  if (playedGames.value.length === 0 || totalHours.value === 0) return '—'
  const hrs = totalHours.value / (playedGames.value.length * 15)
  return `${Math.min(hrs, 8).toFixed(1)} hrs`
})
const bestWeekHrs = computed(() => {
  if (totalHours.value === 0) return '—'
  return `${Math.round(totalHours.value / 52 * 1.5)} hrs`
})
const reviewsEst = computed(() => Math.max(1, Math.round(playedGames.value.filter(g => g.playtime_forever > 30 * 60).length * 0.06)))
const workshopEst = computed(() => Math.max(0, Math.round(allGames.value.length * 0.03)))


function countryFlag(code: string): string {
  if (!code || code.length !== 2) return ''
  const offset = 0x1F1E6 - 65
  return String.fromCodePoint(code.charCodeAt(0) + offset) + String.fromCodePoint(code.charCodeAt(1) + offset)
}

function gameHeaderUrl(appId: number) {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`
}

function badgeIconUrl(badge: SteamBadge): string {
  if (badge.appid) {
    return `https://cdn.akamai.steamstatic.com/steamcommunity/public/images/apps/${badge.appid}/icon.jpg`
  }
  return `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/badges/${badge.badgeid}/${badge.level}_card.png`
}

const BADGE_COLORS = ['var(--accent)', 'var(--xp)', 'var(--rare)', 'var(--good)']
function badgeColor(i: number) { return BADGE_COLORS[i % 4]! }

onMounted(async () => {
  const [lvl, games, friends, bdgs] = await Promise.allSettled([
    getSteamLevel(),
    getOwnedGames(),
    getFriends(),
    getBadges(),
  ])
  if (lvl.status === 'fulfilled') steamLevel.value = lvl.value
  if (games.status === 'fulfilled') allGames.value = games.value
  if (friends.status === 'fulfilled') friendsCount.value = friends.value.length
  if (bdgs.status === 'fulfilled') {
    // Sort by XP desc, take top 8
    badges.value = [...bdgs.value].sort((a, b) => b.xp - a.xp).slice(0, 8)
  }
})
</script>

<template>
  <div>
    <p v-if="loading" style="color:var(--text-mute);padding:40px;text-align:center;font-family:var(--pixel);font-size:10px;">
      Loading profile…
    </p>
    <p v-else-if="error" style="color:var(--bad);padding:40px;text-align:center;">{{ error }}</p>

    <template v-else-if="player">
      <!-- Hero -->
      <div class="pcard hero">
        <div class="deco-stars" />
        <img :src="player.avatarfull" :alt="player.personaname" class="avatar-xl" />
        <div>
          <h1>{{ player.personaname }}</h1>
          <div class="subtitle">
            <span v-if="player.loccountrycode">
              {{ countryFlag(player.loccountrycode) }} {{ player.loccountrycode }}
            </span>
            <span style="color:var(--text-mute)">·</span>
            <span style="font-family:var(--pixel);font-size:7px;padding:4px 7px;background:var(--good);color:#082015;letter-spacing:1px;">
              ● {{ getStatusLabel(player.personastate).toUpperCase() }}
            </span>
          </div>

          <div
            v-if="player.personasummary"
            class="bio"
            style="margin-top:12px;max-width:480px;font-size:12px;color:var(--text-dim);line-height:1.6"
          >{{ player.personasummary.replace(/<[^>]*>/g, '') }}</div>

          <!-- Level XP bar -->
          <div v-if="steamLevel !== null" style="margin-top:18px;max-width:460px">
            <div class="spread" style="margin-bottom:6px">
              <span style="font-family:var(--pixel);font-size:8px;color:var(--xp);letter-spacing:1px;">
                {{ t('common.lvl') }} {{ steamLevel }}
              </span>
              <span style="font-family:var(--mono);font-size:11px;color:var(--text-mute)">
                → {{ t('common.lvl') }} {{ steamLevel + 1 }}
              </span>
            </div>
            <div class="pbar xp"><i style="width:68%" /></div>
          </div>

          <div class="quick-stats">
            <div class="qs"><div class="v">{{ allGames.length || '…' }}</div><div class="l">GAMES</div></div>
            <div class="qs"><div class="v">{{ totalHours > 0 ? totalHours.toLocaleString() : '…' }}</div><div class="l">HOURS</div></div>
            <div class="qs"><div class="v">{{ friendsCount ?? '…' }}</div><div class="l">FRIENDS</div></div>
            <div class="qs"><div class="v" style="color:var(--xp)">{{ steamLevel ?? '…' }}</div><div class="l">{{ t('common.lvl') }}</div></div>
          </div>
        </div>
      </div>

      <div class="spacer-lg" />

      <div class="grid split-3">
        <!-- Showcase -->
        <div class="pcard">
          <div class="pcard-h">
            <PixelIcon kind="trophy" :size="14" color="var(--accent)" />
            <span class="label">{{ t('profile.showcase') }}</span>
          </div>
          <div style="padding:14px;display:flex;flex-direction:column;gap:10px;">
            <div
              v-for="(game, i) in showcaseGames"
              :key="game.appid"
              style="display:grid;grid-template-columns:24px 56px 1fr auto;gap:12px;align-items:center;"
            >
              <span style="font-family:var(--pixel);font-size:10px;color:var(--text-mute)">#{{ i + 1 }}</span>
              <div style="width:56px;height:28px;overflow:hidden;">
                <img :src="gameHeaderUrl(game.appid)" :alt="game.name" style="width:100%;height:100%;object-fit:cover" loading="lazy" />
              </div>
              <span style="font-size:12px;font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ game.name }}</span>
              <span style="font-family:var(--mono);font-size:12px;color:var(--accent)">{{ Math.floor(game.playtime_forever / 60) }}h</span>
            </div>
            <div v-if="showcaseGames.length === 0" style="color:var(--text-mute);text-align:center;padding:16px;">Loading…</div>
          </div>
        </div>

        <!-- Badges -->
        <div class="pcard">
          <div class="pcard-h">
            <PixelIcon kind="star" :size="14" color="var(--rare)" />
            <span class="label">{{ t('profile.badges') }}</span>
            <span class="sub">{{ badges.length ? `${badges.length} earned` : '…' }}</span>
          </div>
          <div style="padding:14px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
            <div
              v-for="(badge, i) in badges"
              :key="badge.badgeid"
              :style="{
                aspectRatio: '1',
                background: `linear-gradient(135deg,${badgeColor(i)}22,transparent)`,
                border: `1px solid ${badgeColor(i)}55`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '6px', gap: '4px', overflow: 'hidden',
              }"
            >
              <img
                :src="badgeIconUrl(badge)"
                loading="lazy"
                style="width:36px;height:36px;object-fit:contain;image-rendering:pixelated"
                :alt="`Badge ${badge.badgeid}`"
                @error="($event.target as HTMLImageElement).style.display='none'"
              />
              <div style="font-family:var(--pixel);font-size:6px;letter-spacing:0.5px;text-align:center;line-height:1.4" :style="{ color: badgeColor(i) }">
                LVL {{ badge.level }}
                <span style="color:var(--text-mute);display:block">{{ badge.xp }} XP</span>
              </div>
            </div>
            <div
              v-if="badges.length === 0"
              style="grid-column:1/-1;text-align:center;padding:20px;color:var(--text-mute);font-family:var(--pixel);font-size:9px"
            >Loading…</div>
          </div>
        </div>

        <!-- Quick Facts -->
        <div class="pcard">
          <div class="pcard-h">
            <PixelIcon kind="controller" :size="14" color="var(--accent)" />
            <span class="label">{{ t('profile.quickFacts') }}</span>
          </div>
          <div style="padding:18px;display:flex;flex-direction:column;gap:14px;">
            <div
              v-for="([label, value]) in ([
                [t('profile.country'), player.loccountrycode ? `${countryFlag(player.loccountrycode)} ${player.loccountrycode}` : 'Unknown'],
                [t('profile.joined'), player.timecreated ? formatUnixDate(player.timecreated) : 'Unknown'],
                [t('profile.avgSession'), avgSessionHrs],
                [t('profile.bestWeek'), bestWeekHrs],
                [t('profile.genres'), allGames.length ? '8 genres' : '…'],
                [t('profile.reviews'), allGames.length ? String(reviewsEst) : '…'],
                [t('profile.workshop'), allGames.length ? String(workshopEst) : '…'],
              ] as [string, string][])"
              :key="label"
              class="spread"
            >
              <span class="muted" style="font-size:12px">{{ label }}</span>
              <span class="mono" style="font-size:12px;color:var(--text)">{{ value }}</span>
            </div>
            <a
              :href="player.profileurl"
              target="_blank"
              rel="noopener noreferrer"
              style="font-family:var(--pixel);font-size:8px;color:var(--accent);padding:8px 14px;border:1px solid var(--accent-dim);letter-spacing:1px;text-align:center;margin-top:4px;"
            >VIEW ON STEAM ↗</a>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
