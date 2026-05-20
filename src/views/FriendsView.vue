<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getFriends, getFriendsSummary } from '@/services/steamApi'
import type { SteamPlayer } from '@/types/steam'
import { getStatusLabel } from '@/utils/steamFormatters'
import { useI18n } from '@/composables/useI18n'
import { useSound } from '@/composables/useSound'

const { t } = useI18n()
const { click } = useSound()

const friends = ref<SteamPlayer[]>([])
const loading = ref(true)
const error = ref('')
const filter = ref<'all' | 'online' | 'offline'>('all')

function statusKind(state: number): 'online' | 'in-game' | 'away' | 'offline' {
  if (state === 1) return 'online'
  if (state === 3 || state === 4) return 'away'
  if (state === 6) return 'in-game'
  return 'offline'
}

const sorted = computed(() => [...friends.value].sort((a, b) => {
  const order = { 'in-game': 0, online: 1, away: 2, offline: 3 }
  return (order[statusKind(a.personastate)] ?? 3) - (order[statusKind(b.personastate)] ?? 3)
}))

const visible = computed(() => {
  if (filter.value === 'all') return sorted.value
  if (filter.value === 'online') return sorted.value.filter(f => statusKind(f.personastate) !== 'offline')
  return sorted.value.filter(f => statusKind(f.personastate) === 'offline')
})

const onlineCount = computed(() => friends.value.filter(f => statusKind(f.personastate) !== 'offline').length)
const offlineCount = computed(() => friends.value.filter(f => statusKind(f.personastate) === 'offline').length)

function dotStyle(state: number): string {
  const k = statusKind(state)
  if (k === 'in-game') return 'background:var(--accent)'
  if (k === 'online') return 'background:var(--good)'
  if (k === 'away') return 'background:var(--xp)'
  return 'background:var(--text-mute)'
}

function statusColor(state: number): string {
  const k = statusKind(state)
  if (k === 'in-game') return 'var(--accent)'
  if (k === 'online') return 'var(--good)'
  if (k === 'away') return 'var(--xp)'
  return 'var(--text-mute)'
}

onMounted(async () => {
  try {
    const friendList = await getFriends()
    friends.value = await getFriendsSummary(friendList.map(f => f.steamid))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load friends list.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div class="section-h">
      <h2>{{ t('nav.friends').toUpperCase() }}</h2>
      <span class="meta" v-if="!loading">
        {{ friends.length }} {{ t('friends.total') }}
        · {{ onlineCount }} {{ t('common.online').toLowerCase() }}
      </span>
    </div>

    <div class="toolbar">
      <button
        v-for="[key, label] in ([
          ['all',     `${t('friends.all')} · ${friends.length}`],
          ['online',  `${t('friends.online')} · ${onlineCount}`],
          ['offline', `${t('friends.offline')} · ${offlineCount}`],
        ] as [string, string][])"
        :key="key"
        class="chip"
        :class="{ active: filter === key }"
        @click="filter = key as typeof filter; click()"
      >{{ label }}</button>
      <div style="flex:1" />
      <button class="chip" style="color:var(--accent);border-color:var(--accent-dim)" @click="click()">
        {{ t('friends.addFriend') }}
      </button>
    </div>

    <p v-if="loading" style="color:var(--text-mute);padding:40px;text-align:center;font-family:var(--pixel);font-size:10px;">
      Loading friends…
    </p>
    <p v-else-if="error" style="color:var(--bad);padding:20px;">{{ error }}</p>

    <div v-else-if="visible.length === 0" class="pcard" style="padding:40px;text-align:center;color:var(--text-mute)">
      No friends in this filter.
    </div>

    <div v-else class="grid friends">
      <div
        v-for="friend in visible"
        :key="friend.steamid"
        class="pcard friend-card"
      >
        <div style="position:relative;flex-shrink:0">
          <img
            :src="friend.avatarfull"
            :alt="friend.personaname"
            class="avatar"
            style="width:56px;height:56px;border:1px solid var(--line-soft)"
          />
          <span
            class="dot"
            :style="`position:absolute;right:-2px;bottom:-2px;${dotStyle(friend.personastate)}`"
          />
        </div>
        <div style="min-width:0">
          <div class="fname">{{ friend.personaname }}</div>
          <div class="fstat" :style="{ color: statusColor(friend.personastate) }">
            <span class="dot" :style="dotStyle(friend.personastate)" />
            <span>{{ getStatusLabel(friend.personastate) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
