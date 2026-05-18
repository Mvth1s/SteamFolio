import type { LibrarySortOption, SteamOwnedGame } from '@/types/steam'

const statusLabels: Record<number, string> = {
  0: 'Offline',
  1: 'Online',
  2: 'Busy',
  3: 'Away',
  4: 'Snooze',
  5: 'Looking to trade',
  6: 'Looking to play',
}

export function getStatusLabel(personaState: number): string {
  return statusLabels[personaState] ?? 'Unknown'
}

export function formatUnixDate(timestamp?: number): string {
  if (!timestamp) {
    return 'Unknown'
  }

  return new Date(timestamp * 1000).toLocaleDateString()
}

export function formatPlaytime(minutes: number): string {
  return `${(minutes / 60).toFixed(1)} h`
}

export function sortAndFilterGames(
  games: SteamOwnedGame[],
  search: string,
  sort: LibrarySortOption,
): SteamOwnedGame[] {
  const normalizedSearch = search.trim().toLowerCase()

  return [...games]
    .filter((game) => game.name.toLowerCase().includes(normalizedSearch))
    .sort((a, b) => {
      switch (sort) {
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'playtime-asc':
          return a.playtime_forever - b.playtime_forever
        case 'playtime-desc':
          return b.playtime_forever - a.playtime_forever
        case 'name-asc':
        default:
          return a.name.localeCompare(b.name)
      }
    })
}

export function buildGameIconUrl(appId: number, iconHash?: string): string {
  if (!iconHash) {
    return 'https://placehold.co/64x64?text=?'
  }

  return `https://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${iconHash}.jpg`
}
