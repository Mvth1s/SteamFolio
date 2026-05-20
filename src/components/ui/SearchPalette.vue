<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PixelIcon from '@/components/shared/PixelIcon.vue'
import { useI18n } from '@/composables/useI18n'
import { useSound } from '@/composables/useSound'
import type { SteamOwnedGame } from '@/types/steam'

const props = defineProps<{ open: boolean; games: SteamOwnedGame[] }>()
const emit = defineEmits<{ close: [] }>()
defineOptions({ name: 'SearchPalette' })

const router = useRouter()
const { t } = useI18n()
const { click, hover } = useSound()

const q = ref('')
const sel = ref(0)
const inputEl = ref<HTMLInputElement | null>(null)

watch(() => props.open, (v) => {
  if (v) {
    q.value = ''
    sel.value = 0
    nextTick(() => inputEl.value?.focus())
  }
})

type Result = { kind: 'game'; name: string; sub: string; appid: number } | { kind: 'nav'; name: string; sub: string; to: string }

const QUICK_LINKS: Result[] = [
  { kind: 'nav', name: 'Dashboard', sub: 'Overview & stats', to: '/dashboard' },
  { kind: 'nav', name: 'Library', sub: 'Your games collection', to: '/library' },
  { kind: 'nav', name: 'Achievements', sub: 'Trophies & progress', to: '/achievements' },
  { kind: 'nav', name: 'Friends', sub: 'Online friends', to: '/friends' },
]

const results = computed<Result[]>(() => {
  const query = q.value.trim().toLowerCase()
  if (!query) return QUICK_LINKS

  const matched = props.games
    .filter(g => g.name.toLowerCase().includes(query))
    .slice(0, 10)
    .map((g): Result => ({
      kind: 'game',
      name: g.name,
      sub: `${Math.floor(g.playtime_forever / 60)}h played`,
      appid: g.appid,
    }))

  return matched.length ? matched : QUICK_LINKS.filter(r => r.name.toLowerCase().includes(query))
})

watch(q, () => { sel.value = 0 })

function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') { e.preventDefault(); sel.value = Math.min(results.value.length - 1, sel.value + 1) }
  else if (e.key === 'ArrowUp') { e.preventDefault(); sel.value = Math.max(0, sel.value - 1) }
  else if (e.key === 'Enter') { e.preventDefault(); pick(results.value[sel.value]) }
  else if (e.key === 'Escape') { e.preventDefault(); emit('close') }
}

function pick(r: Result | undefined) {
  if (!r) return
  click()
  if (r.kind === 'game') {
    router.push({ path: '/library' })
  } else {
    router.push(r.to)
  }
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="sf-palette-backdrop"
      @mousedown.self="emit('close')"
    >
      <div class="sf-palette" @keydown="onKey">
        <div class="sf-palette-h">
          <PixelIcon kind="search" :size="14" color="var(--accent)" />
          <input
            ref="inputEl"
            v-model="q"
            :placeholder="t('search.placeholder')"
          />
          <span style="font-family:var(--pixel);font-size:7px;color:var(--text-mute);padding:2px 5px;border:1px solid var(--line-soft);">ESC</span>
        </div>

        <div v-if="!q.trim()" class="sf-palette-sub">
          {{ t('search.suggestions') }}:
          <button
            v-for="tag in ['RPG', 'Action', 'Indie', 'Strategy']"
            :key="tag"
            class="sf-pill"
            @click="q = tag; hover()"
          >{{ tag }}</button>
        </div>

        <div class="sf-palette-list">
          <div
            v-if="results.length === 0"
            style="padding:28px;text-align:center;color:var(--text-mute);font-family:var(--mono);"
          >{{ t('common.noResults') }}</div>

          <button
            v-for="(r, i) in results"
            :key="`${r.kind}-${r.name}`"
            class="sf-palette-item"
            :class="{ on: i === sel }"
            @mouseenter="sel = i"
            @click="pick(r)"
          >
            <div class="sf-pi-icon">
              <div
                v-if="r.kind === 'game'"
                style="width:44px;height:28px;overflow:hidden;"
              >
                <img
                  :src="`https://cdn.akamai.steamstatic.com/steam/apps/${(r as { kind:'game';appid:number }).appid}/header.jpg`"
                  style="width:100%;height:100%;object-fit:cover"
                  loading="lazy"
                />
              </div>
              <div v-else class="kind-chip genre">→</div>
            </div>
            <div class="sf-pi-body">
              <div class="sf-pi-name">{{ r.name }}</div>
              <div class="sf-pi-sub">{{ r.sub }}</div>
            </div>
            <div class="sf-pi-kind">{{ r.kind }}</div>
          </button>
        </div>

        <div class="sf-palette-foot">
          <span>{{ t('common.keyboard') }}</span>
          <span>{{ results.length }} · {{ t('search.title') }}</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>
