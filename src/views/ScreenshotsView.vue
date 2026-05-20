<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getScreenshots } from '@/services/steamApi'
import type { SteamScreenshot } from '@/types/steam'
import { useI18n } from '@/composables/useI18n'

defineOptions({ name: 'ScreenshotsView' })

const { t } = useI18n()
const screenshots = ref<SteamScreenshot[]>([])
const loading = ref(true)
const error = ref('')

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function screenshotUrl(s: SteamScreenshot): string {
  return s.preview_url || `https://cdn.akamai.steamstatic.com/steam/apps/${s.creator_appid ?? 0}/header.jpg`
}

onMounted(async () => {
  try {
    const raw = await getScreenshots()
    // Filter out items without a preview URL
    screenshots.value = raw.filter(s => s.preview_url)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load screenshots.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div class="section-h">
      <h2>{{ t('nav.screenshots').toUpperCase() }}</h2>
      <span v-if="!loading" class="meta">{{ screenshots.length }} {{ t('lib.totalGames') }}</span>
    </div>

    <p v-if="loading" style="color:var(--text-mute);padding:40px;text-align:center;font-family:var(--pixel);font-size:10px;">
      Loading screenshots…
    </p>
    <p v-else-if="error" style="color:var(--bad);padding:20px;">{{ error }}</p>

    <template v-else>
      <div v-if="screenshots.length === 0" class="pcard" style="padding:40px;text-align:center;color:var(--text-mute)">
        No public screenshots found.
      </div>

      <div v-else style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px">
        <a
          v-for="s in screenshots"
          :key="s.publishedfileid"
          :href="`https://steamcommunity.com/sharedfiles/filedetails/?id=${s.publishedfileid}`"
          target="_blank"
          rel="noopener noreferrer"
          style="text-decoration:none;color:inherit;display:flex;flex-direction:column;background:var(--bg-panel);border:1px solid var(--line-soft);overflow:hidden"
        >
          <div style="aspect-ratio:16/9;overflow:hidden;background:var(--bg-deep)">
            <img
              :src="screenshotUrl(s)"
              :alt="s.title || s.app_name"
              loading="lazy"
              style="width:100%;height:100%;object-fit:cover;display:block;transition:transform .2s"
              @mouseover="($event.target as HTMLImageElement).style.transform='scale(1.03)'"
              @mouseout="($event.target as HTMLImageElement).style.transform=''"
            />
          </div>
          <div style="padding:10px 12px;display:flex;flex-direction:column;gap:4px">
            <div style="font-size:11px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
              {{ s.app_name || 'Unknown game' }}
            </div>
            <div style="font-family:var(--mono);font-size:10px;color:var(--text-mute)">
              {{ formatDate(s.time_created) }}
            </div>
            <div v-if="s.title" style="font-size:10px;color:var(--text-dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
              {{ s.title }}
            </div>
          </div>
        </a>
      </div>
    </template>
  </div>
</template>
