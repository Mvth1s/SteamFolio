import type { SteamAchievement, SteamBadge, SteamFriend, SteamOwnedGame, SteamPlayer, SteamRecentGame, SteamScreenshot, SteamWishlistItem } from '@/types/steam'

const steamId = import.meta.env.VITE_STEAM_ID

function getConfigValue(value: string | undefined, label: string): string {
  if (!value) {
    throw new Error(`${label} is missing. Check your .env file.`)
  }

  return value
}

async function fetchSteamApi<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const id = getConfigValue(steamId, 'VITE_STEAM_ID')

  const queryParams = new URLSearchParams({
    steamid: id,
    steamEndpoint: endpoint,
    ...params,
  })

  const response = await fetch(`/api/steam?${queryParams.toString()}`)

  if (!response.ok) {
    throw new Error(`Steam API request failed with status ${response.status}`)
  }

  return (await response.json()) as T
}

export async function getPlayerSummary(): Promise<SteamPlayer | null> {
  const id = getConfigValue(steamId, 'VITE_STEAM_ID')
  const queryParams = new URLSearchParams({
    steamids: id,
    steamEndpoint: 'ISteamUser/GetPlayerSummaries/v2/',
  })
  const response = await fetch(`/api/steam?${queryParams.toString()}`)
  if (!response.ok) throw new Error(`Steam API request failed with status ${response.status}`)
  const data = (await response.json()) as { response: { players: SteamPlayer[] } }
  return data.response.players[0] ?? null
}

export async function getSteamLevel(): Promise<number | null> {
  const data = await fetchSteamApi<{ response: { player_level?: number } }>('IPlayerService/GetSteamLevel/v1/')
  return data.response.player_level ?? null
}

export async function getOwnedGames(): Promise<SteamOwnedGame[]> {
  const data = await fetchSteamApi<{ response: { games?: SteamOwnedGame[] } }>('IPlayerService/GetOwnedGames/v1/', {
    include_appinfo: 'true',
    include_played_free_games: 'true',
  })

  return data.response.games ?? []
}

export async function getFriends(): Promise<SteamFriend[]> {
  const data = await fetchSteamApi<{ friendslist?: { friends: SteamFriend[] } }>('ISteamUser/GetFriendList/v1/', {
    relationship: 'friend',
  })

  return data.friendslist?.friends ?? []
}

const SUMMARIES_BATCH_SIZE = 100

export async function getFriendsSummary(friendIds: string[]): Promise<SteamPlayer[]> {
  if (!friendIds.length) return []

  const batches: string[][] = []
  for (let i = 0; i < friendIds.length; i += SUMMARIES_BATCH_SIZE) {
    batches.push(friendIds.slice(i, i + SUMMARIES_BATCH_SIZE))
  }

  const results = await Promise.all(
    batches.map(async (batch) => {
      const queryParams = new URLSearchParams({
        steamEndpoint: 'ISteamUser/GetPlayerSummaries/v2/',
        steamids: batch.join(','),
      })
      const response = await fetch(`/api/steam?${queryParams.toString()}`)
      if (!response.ok) throw new Error(`Friend summary request failed with status ${response.status}`)
      const data = (await response.json()) as { response: { players: SteamPlayer[] } }
      return data.response.players
    }),
  )

  return results.flat()
}

export async function getRecentlyPlayedGames(): Promise<SteamRecentGame[]> {
  const data = await fetchSteamApi<{ response: { games?: SteamRecentGame[] } }>('IPlayerService/GetRecentlyPlayedGames/v1/')
  return data.response.games ?? []
}

export async function getWishlist(): Promise<SteamWishlistItem[]> {
  const data = await fetchSteamApi<{ response: { items?: SteamWishlistItem[] } }>('IWishlistService/GetWishlist/v1/')
  return data.response.items ?? []
}

export async function getBadges(): Promise<SteamBadge[]> {
  const data = await fetchSteamApi<{ response: { badges?: SteamBadge[] } }>('IPlayerService/GetBadges/v1/')
  return data.response.badges ?? []
}

export async function getStoreGenres(appId: number): Promise<string[]> {
  try {
    const params = new URLSearchParams({ appids: String(appId), filters: 'genres', l: 'english' })
    const res = await fetch(`/api/store?${params}`)
    if (!res.ok) return []
    const data = (await res.json()) as Record<string, { success: boolean; data?: { genres?: { id: string; description: string }[] } }>
    return data[String(appId)]?.data?.genres?.map(g => g.description) ?? []
  } catch {
    return []
  }
}

export async function getScreenshots(): Promise<SteamScreenshot[]> {
  const data = await fetchSteamApi<{ response?: { publishedfiledetails?: SteamScreenshot[] } }>(
    'IPublishedFileService/GetUserFiles/v1/',
    { type: '5', appid: '0', numperpage: '100', return_short_description: '1' },
  )
  return data.response?.publishedfiledetails ?? []
}

export async function getAchievementRarities(appId: number): Promise<Record<string, number>> {
  const queryParams = new URLSearchParams({
    gameid: String(appId),
    steamEndpoint: 'ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/',
  })
  const response = await fetch(`/api/steam?${queryParams.toString()}`)
  if (!response.ok) return {}
  const data = (await response.json()) as { achievementpercentages?: { achievements: { name: string; percent: number }[] } }
  return Object.fromEntries((data.achievementpercentages?.achievements ?? []).map(a => [a.name, a.percent]))
}

export async function getItemIconHashes(appId: number): Promise<Record<string, string>> {
  const queryParams = new URLSearchParams({
    appid: String(appId),
    steamEndpoint: 'IInventoryService/GetItemDefs/v1/',
    count: '2000',
    start_defid: '0',
  })
  const response = await fetch(`/api/steam?${queryParams.toString()}`)
  // 403 = publisher key required; standard user key is not authorized for this endpoint
  if (response.status === 403) return {}
  if (!response.ok) return {}
  const data = (await response.json()) as {
    response?: { itemdef?: { itemdefid: string; icon_url: string }[] }
  }
  return Object.fromEntries(
    (data.response?.itemdef ?? [])
      .filter(item => item.icon_url)
      .map(item => [item.itemdefid, item.icon_url]),
  )
}

export async function getPlayerAchievements(appId: number): Promise<SteamAchievement[]> {
  const id = getConfigValue(steamId, 'VITE_STEAM_ID')
  const queryParams = new URLSearchParams({
    steamid: id,
    steamEndpoint: 'ISteamUserStats/GetPlayerAchievements/v1/',
    appid: String(appId),
    l: 'english',
  })
  const response = await fetch(`/api/steam?${queryParams.toString()}`)

  // 400 = game has no achievement stats (not an error, just no data)
  if (response.status === 400) return []

  if (!response.ok) throw new Error(`Steam API request failed with status ${response.status}`)

  const data = (await response.json()) as { playerstats?: { achievements?: SteamAchievement[] } }
  return data.playerstats?.achievements ?? []
}
