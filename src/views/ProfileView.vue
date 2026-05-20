<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getSteamLevel, getOwnedGames, getFriends } from '@/services/steamApi'
import { usePlayerSummary } from '@/composables/usePlayerSummary'
import { useI18n } from '@/composables/useI18n'
import { formatUnixDate, getStatusLabel } from '@/utils/steamFormatters'
import PixelIcon from '@/components/shared/PixelIcon.vue'

const { player, loading, error } = usePlayerSummary()
const { t } = useI18n()

const steamLevel = ref<number | null>(null)
const gamesCount = ref<number | null>(null)
const totalHours = ref<number | null>(null)
const friendsCount = ref<number | null>(null)

const statusClass = computed(() => {
  const s = player.value?.personastate ?? 0
  if (s === 1) return 'good'
  if (s === 3 || s === 4) return 'xp'
  return 'text-mute'
})

function countryFlag(code: string): string {
  if (!code || code.length !== 2) return ''
  const offset = 0x1F1E6 - 65
  return String.fromCodePoint(code.charCodeAt(0) + offset) + String.fromCodePoint(code.charCodeAt(1) + offset)
}

onMounted(async () => {
  const [lvl, games, friends] = await Promise.allSettled([
    getSteamLevel(),
    getOwnedGames(),
    getFriends(),
  ])
  if (lvl.status === 'fulfilled') steamLevel.value = lvl.value
  if (games.status === 'fulfilled') {
    gamesCount.value = games.value.length
    totalHours.value = Math.floor(games.value.reduce((s, g) => s + g.playtime_forever, 0) / 60)
  }
  if (friends.status === 'fulfilled') friendsCount.value = friends.value.length
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
        <img
          :src="player.avatarfull"
          :alt="player.personaname"
          class="avatar-xl"
        />
        <div>
          <h1>{{ player.personaname }}</h1>
          <div class="subtitle">
            <span v-if="player.loccountrycode">
              {{ countryFlag(player.loccountrycode) }} {{ player.loccountrycode }}
            </span>
            <span style="color:var(--text-mute)">·</span>
            <span :style="{ color: `var(--${statusClass})` }">
              ● {{ getStatusLabel(player.personastate) }}
            </span>
          </div>

          <div class="quick-stats">
            <div class="qs">
              <div class="v">{{ gamesCount ?? '…' }}</div>
              <div class="l">GAMES</div>
            </div>
            <div class="qs">
              <div class="v">{{ totalHours !== null ? totalHours.toLocaleString() : '…' }}</div>
              <div class="l">HOURS</div>
            </div>
            <div class="qs">
              <div class="v">{{ friendsCount ?? '…' }}</div>
              <div class="l">FRIENDS</div>
            </div>
            <div class="qs">
              <div class="v" style="color:var(--xp)">{{ steamLevel ?? '…' }}</div>
              <div class="l">{{ t('common.lvl') }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="spacer-lg" />

      <!-- Quick facts -->
      <div class="grid split-3">
        <div class="pcard">
          <div class="pcard-h">
            <PixelIcon kind="controller" :size="14" color="var(--accent)" />
            <span class="label">{{ t('profile.quickFacts') }}</span>
          </div>
          <div style="padding:18px;display:flex;flex-direction:column;gap:14px;">
            <div
              v-for="([label, value]) in ([
                [t('profile.country'), player.loccountrycode ? `${countryFlag(player.loccountrycode)} ${player.loccountrycode}` : 'Unknown'],
                ['Status', getStatusLabel(player.personastate)],
                ['Steam ID', player.steamid],
                [t('profile.joined'), player.timecreated ? formatUnixDate(player.timecreated) : 'Unknown'],
                ['Games', gamesCount !== null ? `${gamesCount} games` : '…'],
                ['Playtime', totalHours !== null ? `${totalHours.toLocaleString()} hours` : '…'],
              ] as [string, string][])"
              :key="label"
              class="spread"
            >
              <span class="muted" style="font-size:12px">{{ label }}</span>
              <span class="mono" style="font-size:12px;color:var(--text)">{{ value }}</span>
            </div>
          </div>
        </div>

        <div class="pcard" style="grid-column:span 2">
          <div class="pcard-h">
            <PixelIcon kind="trophy" :size="14" color="var(--accent)" />
            <span class="label">STEAM PROFILE</span>
          </div>
          <div style="padding:24px;display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center;">
            <img
              :src="player.avatarfull"
              :alt="player.personaname"
              style="width:96px;height:96px;border:3px solid var(--accent);"
            />
            <div>
              <div style="font-family:var(--pixel);font-size:13px;color:var(--text);margin-bottom:8px;">
                {{ player.personaname }}
              </div>
              <a
                :href="player.profileurl"
                target="_blank"
                rel="noopener noreferrer"
                style="font-family:var(--pixel);font-size:8px;color:var(--accent);padding:8px 14px;border:1px solid var(--accent-dim);letter-spacing:1px;"
              >
                VIEW ON STEAM ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
