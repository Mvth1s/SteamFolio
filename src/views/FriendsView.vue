<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getFriends, getFriendsSummary } from '@/services/steamApi'
import type { SteamPlayer } from '@/types/steam'
import { getStatusLabel } from '@/utils/steamFormatters'

const friends = ref<SteamPlayer[]>([])
const loading = ref(true)
const error = ref('')

const sortedFriends = computed(() => [...friends.value].sort((a, b) => a.personaname.localeCompare(b.personaname)))

onMounted(async () => {
  try {
    const friendList = await getFriends()
    friends.value = await getFriendsSummary(friendList.map((friend) => friend.steamid))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load friends list.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-lg">
    <h2 class="mb-4 text-xl font-semibold text-white">Friends list</h2>

    <p v-if="loading" class="text-slate-300">Loading friends...</p>
    <p v-else-if="error" class="text-red-300">{{ error }}</p>

    <ul v-else class="space-y-2">
      <li
        v-for="friend in sortedFriends"
        :key="friend.steamid"
        class="flex items-center justify-between rounded-md border border-slate-700 bg-slate-900 p-3"
      >
        <div class="flex items-center gap-3">
          <img :src="friend.avatarfull" :alt="`${friend.personaname} avatar`" class="h-10 w-10 rounded" />
          <div>
            <p class="font-medium text-slate-100">{{ friend.personaname }}</p>
            <p class="text-sm text-slate-300">{{ getStatusLabel(friend.personastate) }}</p>
          </div>
        </div>

        <a
          :href="friend.profileurl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-cyan-300 hover:text-cyan-200"
        >
          View profile
        </a>
      </li>
    </ul>
  </section>
</template>
