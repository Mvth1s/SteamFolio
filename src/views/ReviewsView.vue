<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getOwnedGames } from '@/services/steamApi'
import type { SteamOwnedGame } from '@/types/steam'
import { useI18n } from '@/composables/useI18n'

defineOptions({ name: 'ReviewsView' })

const { t } = useI18n()
const allGames = ref<SteamOwnedGame[]>([])
const loading = ref(true)
const error = ref('')

const reviewableGames = computed(() =>
  [...allGames.value]
    .filter(g => g.playtime_forever >= 30)
    .sort((a, b) => b.playtime_forever - a.playtime_forever)
)

const STORE_BASE = 'https://store.steampowered.com/app'

function headerUrl(appid: number) {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`
}

function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60)
  return h >= 1 ? `${h.toLocaleString()}h` : `${minutes}min`
}

onMounted(async () => {
  try {
    allGames.value = await getOwnedGames()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load library.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div class="section-h">
      <h2>{{ t('nav.reviews').toUpperCase() }}</h2>
      <span v-if="!loading" class="meta">{{ reviewableGames.length }} {{ t('lib.totalGames') }}</span>
    </div>

    <p v-if="loading" style="color:var(--text-mute);padding:40px;text-align:center;font-family:var(--pixel);font-size:10px;">
      Loading…
    </p>
    <p v-else-if="error" style="color:var(--bad);padding:20px;">{{ error }}</p>

    <template v-else>
      <div class="pcard" style="padding:12px 16px;margin-bottom:16px;font-size:11px;color:var(--text-mute);border-left:2px solid var(--accent-dim)">
        Games you've played, sorted by playtime. Hit REVIEW ↗ to write or update a review on Steam.
      </div>

      <div v-if="reviewableGames.length === 0" class="pcard" style="padding:40px;text-align:center;color:var(--text-mute)">
        No reviewable games yet.
      </div>

      <div v-else class="grid cards">
        <div
          v-for="game in reviewableGames"
          :key="game.appid"
          class="game-card"
        >
          <div class="gcover">
            <img
              :src="headerUrl(game.appid)"
              :alt="game.name"
              loading="lazy"
              style="width:100%;height:100%;object-fit:cover;display:block"
            />
          </div>
          <div class="ginfo">
            <div class="gname">{{ game.name }}</div>
            <div class="gmeta" style="margin-top:6px;display:flex;gap:8px;align-items:center">
              <span style="font-family:var(--mono);font-size:11px;color:var(--accent)">{{ formatHours(game.playtime_forever) }}</span>
              <a
                :href="`${STORE_BASE}/${game.appid}/#app_reviews_hash`"
                target="_blank"
                rel="noopener noreferrer"
                style="font-family:var(--pixel);font-size:7px;color:var(--accent);letter-spacing:1px;padding:2px 5px;border:1px solid var(--accent-dim)"
              >REVIEW ↗</a>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
