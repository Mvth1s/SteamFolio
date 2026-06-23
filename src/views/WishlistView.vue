<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { getWishlist, getStoreDetail } from '@/services/steamApi'
import type { SteamWishlistItem, StoreGameDetails } from '@/types/steam'
import { useI18n } from '@/composables/useI18n'

defineOptions({ name: 'WishlistView' })

const { t } = useI18n()

type SortKey = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'discount-desc'

const items = ref<SteamWishlistItem[]>([])
const storeDetails = reactive(new Map<number, StoreGameDetails>())
const loading = ref(true)
const detailsLoading = ref(true)
const error = ref('')
const sort = ref<SortKey>('date-desc')

const STORE_BASE = 'https://store.steampowered.com/app'
const INTER_REQUEST_DELAY = 300
const CONCURRENCY = 2
const CACHE_KEY = 'sf:wishlist_store'
const CACHE_TTL = 24 * 60 * 60 * 1000

type CacheEntry = { d: StoreGameDetails; t: number }

function readCache(): Record<string, CacheEntry> {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}') as Record<string, CacheEntry> }
  catch { return {} }
}

const SORTS: { key: SortKey; labelKey: string }[] = [
  { key: 'date-desc',     labelKey: 'wishlist.sortDate' },
  { key: 'name-asc',      labelKey: 'wishlist.sortName' },
  { key: 'price-asc',     labelKey: 'wishlist.sortPrice' },
  { key: 'discount-desc', labelKey: 'wishlist.sortDiscount' },
]

function headerUrl(appid: number) {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`
}

const DATE_FMT: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString(undefined, DATE_FMT)
}

// Steam returns release dates as "15 Jan, 2014" (English strings) — parse and reformat
// in browser locale so both dates look uniform. Falls back to raw string if unparseable.
function formatReleaseDate(dateStr: string): string {
  const m = dateStr.match(/^(\d{1,2})\s+([A-Za-z]+),?\s+(\d{4})$/)
  if (m) {
    const d = new Date(`${m[2]} ${m[1]}, ${m[3]}`)
    if (!isNaN(d.getTime())) return d.toLocaleDateString(undefined, DATE_FMT)
  }
  return dateStr
}

function toggleSort(key: SortKey) {
  if (sort.value === key) {
    sort.value = key === 'date-desc' ? 'date-asc'
                : key === 'date-asc'  ? 'date-desc'
                : key === 'name-asc'  ? 'name-desc'
                : key === 'name-desc' ? 'name-asc'
                : key === 'price-asc' ? 'price-desc'
                :                       'price-asc'
  } else {
    sort.value = key
  }
}

function isSortActive(key: SortKey): boolean {
  const base: Record<SortKey, SortKey> = {
    'date-desc': 'date-desc', 'date-asc': 'date-desc',
    'name-asc': 'name-asc',   'name-desc': 'name-asc',
    'price-asc': 'price-asc', 'price-desc': 'price-asc',
    'discount-desc': 'discount-desc',
  }
  return base[sort.value] === key
}

function sortArrow(key: SortKey): string {
  if (!isSortActive(key)) return ''
  return ['date-desc', 'name-desc', 'price-desc', 'discount-desc'].includes(sort.value) ? ' ↓' : ' ↑'
}

const sortedItems = computed(() => {
  return [...items.value].sort((a, b) => {
    const da = storeDetails.get(a.appid)
    const db = storeDetails.get(b.appid)
    switch (sort.value) {
      case 'date-desc':     return (b.date_added ?? 0) - (a.date_added ?? 0)
      case 'date-asc':      return (a.date_added ?? 0) - (b.date_added ?? 0)
      case 'name-asc':      return (da?.name ?? '').localeCompare(db?.name ?? '')
      case 'name-desc':     return (db?.name ?? '').localeCompare(da?.name ?? '')
      case 'price-asc':     return (da?.priceFinal ?? 0) - (db?.priceFinal ?? 0)
      case 'price-desc':    return (db?.priceFinal ?? 0) - (da?.priceFinal ?? 0)
      case 'discount-desc': return (db?.discountPercent ?? 0) - (da?.discountPercent ?? 0)
    }
  })
})

async function loadAllDetails(appIds: number[]) {
  const cache = readCache()
  const now = Date.now()

  // Populate from cache immediately — makes return visits instant
  for (const id of appIds) {
    const entry = cache[id]
    if (entry && now - entry.t < CACHE_TTL) {
      storeDetails.set(id, entry.d)
    }
  }

  const toFetch = appIds.filter(id => !storeDetails.has(id))
  if (!toFetch.length) {
    detailsLoading.value = false
    return
  }

  // Shared rate gate: requests fire no faster than INTER_REQUEST_DELAY ms apart,
  // regardless of how many workers claim slots simultaneously.
  let nextSlot = Date.now()
  function claimSlot(): number {
    const t = Date.now()
    if (nextSlot < t) nextSlot = t
    const wait = nextSlot - t
    nextSlot += INTER_REQUEST_DELAY
    return wait
  }

  let idx = 0
  async function worker() {
    while (idx < toFetch.length) {
      const appId = toFetch[idx++]
      const wait = claimSlot()
      if (wait > 0) await new Promise(r => setTimeout(r, wait))
      const detail = await getStoreDetail(appId)
      if (detail) {
        storeDetails.set(appId, detail)
        cache[appId] = { d: detail, t: now }
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)) } catch {}
      }
    }
  }

  await Promise.allSettled(Array.from({ length: CONCURRENCY }, worker))
  detailsLoading.value = false
}

onMounted(async () => {
  try {
    items.value = await getWishlist()
    if (items.value.length) {
      loadAllDetails(items.value.map(i => i.appid))
    } else {
      detailsLoading.value = false
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load wishlist.'
    detailsLoading.value = false
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

      <template v-else>
        <!-- Sort bar + progress -->
        <div style="margin-bottom:20px">
          <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;align-items:center">
            <button
              v-for="s in SORTS"
              :key="s.key"
              class="sort-btn"
              :class="{ active: isSortActive(s.key) }"
              @click="toggleSort(s.key)"
            >{{ t(s.labelKey) }}{{ sortArrow(s.key) }}</button>
          </div>
          <div v-if="detailsLoading" style="display:flex;flex-direction:column;gap:5px">
            <div style="display:flex;justify-content:space-between;align-items:baseline">
              <span style="font-family:var(--pixel);font-size:7px;color:var(--text-mute);letter-spacing:1px">{{ t('wishlist.loading') }}</span>
              <span style="font-family:var(--pixel);font-size:7px;color:var(--text-dim)">
                {{ storeDetails.size }}<span style="color:var(--text-mute)">/{{ items.length }}</span>
              </span>
            </div>
            <div style="height:3px;background:var(--line-soft);overflow:hidden">
              <div
                :style="{
                  height: '100%',
                  width: items.length ? `${Math.round(storeDetails.size / items.length * 100)}%` : '0%',
                  background: 'var(--accent)',
                  transition: 'width 250ms linear',
                }"
              />
            </div>
          </div>
        </div>

        <!-- Cards grid -->
        <div class="grid cards">
          <a
            v-for="item in sortedItems"
            :key="item.appid"
            :href="`${STORE_BASE}/${item.appid}/`"
            target="_blank"
            rel="noopener noreferrer"
            class="game-card"
            style="text-decoration:none;color:inherit;display:flex;flex-direction:column"
          >
            <!-- Cover image -->
            <div class="gcover" style="position:relative;flex-shrink:0">
              <img
                :src="headerUrl(item.appid)"
                :alt="storeDetails.get(item.appid)?.name ?? `App ${item.appid}`"
                loading="lazy"
                style="width:100%;height:100%;object-fit:cover;display:block"
              />
              <!-- Discount badge -->
              <span
                v-if="(storeDetails.get(item.appid)?.discountPercent ?? 0) > 0"
                style="position:absolute;top:6px;right:6px;font-family:var(--pixel);font-size:8px;background:var(--good);color:#082015;padding:2px 6px;letter-spacing:1px"
              >-{{ storeDetails.get(item.appid)!.discountPercent }}%</span>
            </div>

            <!-- Info block -->
            <div class="ginfo" style="flex:1;display:flex;flex-direction:column;gap:4px">
              <!-- Game name -->
              <div
                class="gname"
                style="font-weight:600;font-size:12px;line-height:1.35;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical"
              >
                <template v-if="storeDetails.has(item.appid)">{{ storeDetails.get(item.appid)!.name }}</template>
                <span v-else style="color:var(--text-mute)">…</span>
              </div>

              <!-- Price -->
              <div style="display:flex;align-items:baseline;gap:6px">
                <template v-if="storeDetails.has(item.appid)">
                  <template v-if="storeDetails.get(item.appid)!.priceFormatted">
                    <span
                      v-if="storeDetails.get(item.appid)!.priceOriginalFormatted"
                      style="font-family:var(--mono);font-size:10px;color:var(--text-mute);text-decoration:line-through"
                    >{{ storeDetails.get(item.appid)!.priceOriginalFormatted }}</span>
                    <span style="font-family:var(--mono);font-size:12px;font-weight:600;color:var(--good)">
                      {{ storeDetails.get(item.appid)!.priceFormatted }}
                    </span>
                  </template>
                  <span v-else style="font-family:var(--mono);font-size:11px;color:var(--text-mute)">
                    {{ t('wishlist.noPrice') }}
                  </span>
                </template>
                <span v-else style="font-family:var(--mono);font-size:11px;color:var(--text-mute)">…</span>
              </div>

              <!-- Developer -->
              <div
                v-if="storeDetails.get(item.appid)?.developers?.length"
                style="font-size:10px;color:var(--text-mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
              >{{ storeDetails.get(item.appid)!.developers.join(', ') }}</div>

              <!-- Dates -->
              <div style="display:flex;flex-direction:column;gap:2px;margin-top:auto;padding-top:6px">
                <div
                  v-if="storeDetails.get(item.appid)?.releaseDate"
                  style="display:flex;gap:4px;font-family:var(--mono);font-size:10px;color:var(--text-mute)"
                >
                  <span style="color:var(--text-dim)">{{ t('wishlist.released') }}</span>
                  <span v-if="storeDetails.get(item.appid)!.comingSoon" style="color:var(--xp)">{{ t('wishlist.comingSoon') }}</span>
                  <span v-else>{{ formatReleaseDate(storeDetails.get(item.appid)!.releaseDate!) }}</span>
                </div>
                <div
                  v-if="item.date_added"
                  style="display:flex;gap:4px;font-family:var(--mono);font-size:10px;color:var(--text-mute)"
                >
                  <span style="color:var(--text-dim)">{{ t('wishlist.added') }}</span>
                  <span>{{ formatDate(item.date_added) }}</span>
                </div>
              </div>
            </div>
          </a>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.sort-btn {
  font-family: var(--pixel);
  font-size: 8px;
  letter-spacing: 1px;
  padding: 6px 12px;
  border: 1px solid var(--line-soft);
  background: transparent;
  color: var(--text-mute);
  cursor: pointer;
  transition: color .15s, border-color .15s;
}
.sort-btn:hover {
  color: var(--text);
  border-color: var(--accent-dim);
}
.sort-btn.active {
  color: var(--accent);
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 8%, transparent);
}
</style>
