import type { SteamAchievement, SteamFriend, SteamOwnedGame, SteamPlayer } from '@/types/steam'

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
  const data = await fetchSteamApi<{ response: { players: SteamPlayer[] } }>('ISteamUser/GetPlayerSummaries/v2/')

  return data.response.players[0] ?? null
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

export async function getFriendsSummary(friendIds: string[]): Promise<SteamPlayer[]> {
  if (!friendIds.length) {
    return []
  }

  const queryParams = new URLSearchParams({
    steamEndpoint: 'ISteamUser/GetPlayerSummaries/v2/',
    steamids: friendIds.join(','),
  })

  const response = await fetch(`/api/steam?${queryParams.toString()}`)

  if (!response.ok) {
    throw new Error(`Friend summary request failed with status ${response.status}`)
  }

  const data = (await response.json()) as { response: { players: SteamPlayer[] } }
  return data.response.players
}

export async function getPlayerAchievements(appId: number): Promise<SteamAchievement[]> {
  const data = await fetchSteamApi<{
    playerstats?: {
      achievements?: SteamAchievement[]
    }
  }>('ISteamUserStats/GetPlayerAchievements/v1/', {
    appid: String(appId),
    l: 'english',
  })

  return data.playerstats?.achievements ?? []
}
