import { ref } from 'vue'
import { getPlayerSummary } from '@/services/steamApi'
import type { SteamPlayer } from '@/types/steam'

const player = ref<SteamPlayer | null>(null)
const loading = ref(true)
const error = ref('')

// Single fetch shared across all consumers — resolved once, reused everywhere.
const fetchPromise = getPlayerSummary()
  .then((data) => { player.value = data })
  .catch((err) => { error.value = err instanceof Error ? err.message : 'Unable to load profile.' })
  .finally(() => { loading.value = false })

export function usePlayerSummary() {
  return { player, loading, error, fetchPromise }
}
