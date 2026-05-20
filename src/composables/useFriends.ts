import { ref } from 'vue'
import { getFriends, getFriendsSummary } from '@/services/steamApi'
import type { SteamPlayer } from '@/types/steam'

const friends = ref<SteamPlayer[]>([])
const loading = ref(false)
const loaded = ref(false)

let promise: Promise<void> | null = null

function load(): Promise<void> {
  if (loaded.value) return Promise.resolve()
  if (promise) return promise
  loading.value = true
  promise = (async () => {
    try {
      const list = await getFriends()
      friends.value = await getFriendsSummary(list.map(f => f.steamid))
      loaded.value = true
    } catch {
      /* non-critical */
    } finally {
      loading.value = false
    }
  })()
  return promise
}

export function useFriends() {
  return { friends, loading, loaded, load }
}
