<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getOwnedGames } from '@/services/steamApi'
import type { LibrarySortOption, SteamOwnedGame } from '@/types/steam'
import { sortAndFilterGames } from '@/utils/steamFormatters'
import { useI18n } from '@/composables/useI18n'
import { useSound } from '@/composables/useSound'
import PixelIcon from '@/components/shared/PixelIcon.vue'

const { t } = useI18n()
const { click } = useSound()

const games = ref<SteamOwnedGame[]>([])
const loading = ref(true)
const error = ref('')
const search = ref('')
const sort = ref<LibrarySortOption>('playtime-desc')

const filtered = computed(() => sortAndFilterGames(games.value, search.value, sort.value))

const totalHours = computed(() => Math.floor(games.value.reduce((s, g) => s + g.playtime_forever, 0) / 60))

onMounted(async () => {
  try {
    games.value = await getOwnedGames()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load game library.'
  } finally {
    loading.value = false
  }
})

function gameHeaderUrl(appId: number) {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`
}

function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60)
  return h > 0 ? `${h}h` : `${minutes}m`
}

const GENRES = ['RPG', 'ACTION', 'STRATEGY', 'INDIE', 'ADVENTURE', 'SIMULATION', 'SPORTS', 'PUZZLE']

function genreFromName(name: string): string {
  let h = 2166136261 >>> 0
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return GENRES[h % GENRES.length]!
}

function formatLastPlayed(ts: number): string {
  if (!ts) return ''
  const days = Math.floor((Date.now() / 1000 - ts) / 86400)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}wk ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

const SORT_OPTIONS: { value: LibrarySortOption; labelKey: string }[] = [
  { value: 'playtime-desc', labelKey: 'lib.byPlay' },
  { value: 'name-asc',      labelKey: 'lib.alpha' },
  { value: 'name-desc',     labelKey: 'Z → A' },
  { value: 'playtime-asc',  labelKey: 'lib.recent' },
]
</script>

<template>
  <div>
    <div class="section-h">
      <h2>{{ t('nav.library').toUpperCase() }}</h2>
      <span class="meta">
        <template v-if="!loading">
          {{ games.length }} {{ t('lib.totalGames') }} · {{ totalHours.toLocaleString() }} {{ t('lib.totalHrs') }}
        </template>
      </span>
    </div>

    <div class="toolbar">
      <div class="field">
        <PixelIcon kind="search" :size="14" color="var(--text-mute)" />
        <input
          v-model="search"
          :placeholder="t('lib.placeholder')"
        />
        <button
          v-if="search"
          class="muted mono"
          style="font-size:11px"
          @click="search = ''; click()"
        >{{ t('common.clear') }}</button>
      </div>
      <button
        v-for="opt in SORT_OPTIONS"
        :key="opt.value"
        class="chip"
        :class="{ active: sort === opt.value }"
        @click="sort = opt.value; click()"
      >{{ t(opt.labelKey) }}</button>
    </div>

    <p v-if="loading" style="color:var(--text-mute);padding:40px;text-align:center;font-family:var(--pixel);font-size:10px;">
      Loading library…
    </p>
    <p v-else-if="error" style="color:var(--bad);padding:20px;">{{ error }}</p>

    <template v-else>
      <div v-if="filtered.length === 0" class="pcard" style="padding:40px;text-align:center;color:var(--text-mute)">
        {{ t('lib.noMatch') }} "{{ search }}".
      </div>

      <div v-else class="grid cards">
        <div
          v-for="game in filtered"
          :key="game.appid"
          class="game-card"
        >
          <div class="gcover">
            <img
              :src="gameHeaderUrl(game.appid)"
              :alt="game.name"
              loading="lazy"
              style="width:100%;height:100%;object-fit:cover;display:block;"
            />
          </div>
          <div class="ginfo">
            <div class="gname">{{ game.name }}</div>
            <div class="gmeta">
              <span class="h">{{ formatHours(game.playtime_forever) }}</span>
              <span v-if="game.playtime_forever === 0" style="color:var(--text-mute)">never played</span>
              <span v-else-if="game.rtime_last_played" style="color:var(--text-mute)">{{ formatLastPlayed(game.rtime_last_played) }}</span>
            </div>
            <div class="gmeta" style="margin-top:4px">
              <span style="font-family:var(--pixel);font-size:7px;letter-spacing:1px;color:var(--text-mute);padding:2px 5px;border:1px solid var(--line-soft)">{{ genreFromName(game.name) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
