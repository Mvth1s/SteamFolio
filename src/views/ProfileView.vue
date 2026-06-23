<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { getSteamLevel, getOwnedGames, getFriends, getBadges, getItemIconHashes } from '@/services/steamApi'
import type { SteamBadge, SteamBadgeStats } from '@/types/steam'
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
const badgeXpStats = ref<Omit<SteamBadgeStats, 'badges'> | null>(null)
const badgeIconHashes = reactive(new Map<string, string>())

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

function badgeGameName(badge: SteamBadge): string {
  if (!badge.appid) return ''
  const name = allGames.value.find(g => g.appid === badge.appid)?.name ?? ''
  return name.length > 14 ? name.slice(0, 13) + '…' : name
}

const xpPct = computed(() => {
  const s = badgeXpStats.value
  if (!s) return 0
  const progress = s.player_xp - s.player_xp_needed_current_level
  const span = progress + s.player_xp_needed_to_level_up
  return span > 0 ? Math.round((progress / span) * 100) : 0
})

const BADGE_COLORS = ['var(--accent)', 'var(--xp)', 'var(--rare)', 'var(--good)']
function badgeColor(i: number) { return BADGE_COLORS[i % 4]! }

const BADGE_CDN = 'https://community.fastly.steamstatic.com/public/images/badges'

function systemBadgeUrl(badgeid: number, level: number): string {
  const lv = String(level).padStart(2, '0')
  switch (badgeid) {
    case 1:  return `${BADGE_CDN}/01_community/community${lv}_80.png`
    case 2:  return `${BADGE_CDN}/02_years/steamyears${level}_54.png`
    case 3:  return `${BADGE_CDN}/03_together/together${lv}_80.png`
    case 4:  return `${BADGE_CDN}/04_saleitem/saleitem${lv}_80.png`
    case 5:  return `${BADGE_CDN}/05_cardbadge/card${lv}_80.png`
    case 13: return `${BADGE_CDN}/13_gamecollector/${level}_80.png`
    default: return `${BADGE_CDN}/${badgeid}/${level}.png`
  }
}

function badgeImageUrl(badge: SteamBadge): string {
  if (badge.appid && badge.communityitemid) {
    const iconHash = badgeIconHashes.get(`${badge.appid}:${badge.communityitemid}`)
    if (iconHash)
      return `https://cdn.akamai.steamstatic.com/steamcommunity/public/images/items/${badge.appid}/${iconHash}.png`
    return `https://cdn.akamai.steamstatic.com/steam/apps/${badge.appid}/header.jpg`
  }
  return systemBadgeUrl(badge.badgeid, badge.level)
}

function handleBadgeImgError(event: Event) {
  const img = event.target as HTMLImageElement
  img.onerror = null
  img.style.display = 'none'
}

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
    const { badges: bdgList, ...xpStats } = bdgs.value
    badgeXpStats.value = xpStats
    badges.value = [...bdgList].sort((a, b) => b.xp - a.xp).slice(0, 8)
    // Background: fetch item icon hashes for each unique game that has a badge
    const appIds = [...new Set(badges.value.filter(b => b.appid && b.communityitemid).map(b => b.appid!))]
    Promise.all(appIds.map(async appId => {
      const hashes = await getItemIconHashes(appId)
      for (const [itemdefid, iconHash] of Object.entries(hashes)) {
        badgeIconHashes.set(`${appId}:${itemdefid}`, iconHash)
      }
    })).catch(() => {})
  }
})
</script>

<template>
  <div>
    <p v-if="loading" style="color:var(--text-mute);padding:40px;text-align:center;font-family:var(--pixel);font-size:10px;">
      {{ t('common.loading') }}
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
                {{ badgeXpStats ? `${(badgeXpStats.player_xp - badgeXpStats.player_xp_needed_current_level).toLocaleString()} / ${(badgeXpStats.player_xp - badgeXpStats.player_xp_needed_current_level + badgeXpStats.player_xp_needed_to_level_up).toLocaleString()} XP` : '' }} → {{ t('common.lvl') }} {{ steamLevel + 1 }}
              </span>
            </div>
            <div class="pbar xp"><i :style="{ width: `${xpPct}%` }" /></div>
          </div>

          <div class="quick-stats">
            <div class="qs"><div class="v">{{ allGames.length || '…' }}</div><div class="l">{{ t('lib.totalGames').toUpperCase() }}</div></div>
            <div class="qs"><div class="v">{{ totalHours > 0 ? totalHours.toLocaleString() : '…' }}</div><div class="l">{{ t('common.hours').toUpperCase() }}</div></div>
            <div class="qs"><div class="v">{{ friendsCount ?? '…' }}</div><div class="l">{{ t('nav.friends').toUpperCase() }}</div></div>
            <div class="qs"><div class="v" style="color:var(--xp)">{{ steamLevel ?? '…' }}</div><div class="l">{{ t('common.lvl') }}</div></div>
          </div>
          <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap">
            <a
              :href="player.profileurl"
              target="_blank"
              rel="noopener noreferrer"
              style="font-family:var(--pixel);font-size:8px;color:var(--accent);padding:8px 14px;border:1px solid var(--accent-dim);letter-spacing:1px;text-decoration:none"
            >{{ t('profile.steamProfile') }}</a>
            <a
              :href="`steam://friends/add/${player.steamid}`"
              style="font-family:var(--pixel);font-size:8px;color:var(--good);padding:8px 14px;border:1px solid var(--good);letter-spacing:1px;text-decoration:none"
            >{{ t('profile.addFriend') }}</a>
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
            <a
              v-for="(game, i) in showcaseGames"
              :key="game.appid"
              :href="`https://store.steampowered.com/app/${game.appid}/`"
              target="_blank"
              rel="noopener noreferrer"
              style="display:grid;grid-template-columns:24px 56px 1fr auto;gap:12px;align-items:center;text-decoration:none;color:inherit"
            >
              <span style="font-family:var(--pixel);font-size:10px;color:var(--text-mute)">#{{ i + 1 }}</span>
              <div style="width:56px;height:28px;overflow:hidden;">
                <img :src="gameHeaderUrl(game.appid)" :alt="game.name" style="width:100%;height:100%;object-fit:cover" loading="lazy" />
              </div>
              <span style="font-size:12px;font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ game.name }}</span>
              <span style="font-family:var(--mono);font-size:12px;color:var(--accent)">{{ Math.floor(game.playtime_forever / 60) }}h</span>
            </a>
            <div v-if="showcaseGames.length === 0" style="color:var(--text-mute);text-align:center;padding:16px;">{{ t('common.loading') }}</div>
          </div>
        </div>

        <!-- Badges -->
        <div class="pcard">
          <div class="pcard-h">
            <PixelIcon kind="star" :size="14" color="var(--rare)" />
            <span class="label">{{ t('profile.badges') }}</span>
            <span class="sub">{{ badges.length ? `${badges.length} ${t('profile.earned')}` : '…' }}</span>
          </div>
          <div style="padding:14px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
            <a
              v-for="(badge, i) in badges"
              :key="badge.badgeid"
              :href="badge.appid ? `https://store.steampowered.com/app/${badge.appid}/` : `${player?.profileurl}badges/`"
              target="_blank"
              rel="noopener noreferrer"
              :style="{
                aspectRatio: '1',
                background: `linear-gradient(135deg,${badgeColor(i)}22,transparent)`,
                border: `1px solid ${badgeColor(i)}55`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '6px', overflow: 'hidden', textDecoration: 'none', padding: '8px 4px',
              }"
            >
              <img
                :src="badgeImageUrl(badge)"
                loading="lazy"
                style="width:56px;height:56px;object-fit:contain;display:block;flex-shrink:0"
                :alt="badgeGameName(badge) || `Badge #${badge.badgeid}`"
                @error="handleBadgeImgError($event)"
              />
              <div style="font-family:var(--pixel);font-size:5px;letter-spacing:0.5px;text-align:center;line-height:1.5;padding:0 2px" :style="{ color: badgeColor(i) }">
                {{ badgeGameName(badge) || `#${badge.badgeid}` }}
                <span style="color:var(--text-mute);display:block;margin-top:2px">{{ t('common.lvl') }} {{ badge.level }} · {{ badge.xp }}XP</span>
              </div>
            </a>
            <div
              v-if="badges.length === 0"
              style="grid-column:1/-1;text-align:center;padding:20px;color:var(--text-mute);font-family:var(--pixel);font-size:9px"
            >{{ t('common.loading') }}</div>
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
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
