<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getWishlist } from '@/services/steamApi'
import type { SteamWishlistItem } from '@/types/steam'
import { useI18n } from '@/composables/useI18n'

defineOptions({ name: 'WishlistView' })

const { t } = useI18n()
const items = ref<SteamWishlistItem[]>([])
const loading = ref(true)
const error = ref('')

const STORE_BASE = 'https://store.steampowered.com/app'

function headerUrl(appid: number) {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`
}

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(async () => {
  try {
    items.value = await getWishlist()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load wishlist.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div class="section-h">
      <h2>{{ t('nav.wishlist').toUpperCase() }}</h2>
      <span v-if="!loading" class="meta">{{ items.length }} {{ t('lib.totalGames') }}</span>
    </div>

    <p v-if="loading" style="color:var(--text-mute);padding:40px;text-align:center;font-family:var(--pixel);font-size:10px;">
      {{ t('wishlist.loading') }}
    </p>
    <p v-else-if="error" style="color:var(--bad);padding:20px;">{{ error }}</p>

    <template v-else>
      <div v-if="items.length === 0" class="pcard" style="padding:40px;text-align:center;color:var(--text-mute)">
        {{ t('wishlist.empty') }}
      </div>

      <div v-else class="grid cards">
        <div
          v-for="(item, i) in items"
          :key="item.appid"
          class="game-card"
        >
          <div class="gcover" style="position:relative">
            <img
              :src="headerUrl(item.appid)"
              :alt="`App ${item.appid}`"
              loading="lazy"
              style="width:100%;height:100%;object-fit:cover;display:block"
            />
            <span style="position:absolute;top:6px;left:6px;font-family:var(--pixel);font-size:8px;background:var(--bg-deep);color:var(--accent);padding:2px 5px;border:1px solid var(--accent-dim)">
              #{{ i + 1 }}
            </span>
          </div>
          <div class="ginfo">
            <div class="gname" style="font-family:var(--mono);font-size:10px;color:var(--text-mute)">
              {{ item.date_added ? formatDate(item.date_added) : `#${item.appid}` }}
            </div>
            <div class="gmeta" style="margin-top:6px">
              <a
                :href="`${STORE_BASE}/${item.appid}/`"
                target="_blank"
                rel="noopener noreferrer"
                style="font-family:var(--pixel);font-size:7px;color:var(--accent);letter-spacing:1px;padding:2px 5px;border:1px solid var(--accent-dim)"
              >{{ t('wishlist.store') }}</a>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
