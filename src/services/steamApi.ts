import type { SteamAchievement, SteamFriend, SteamOwnedGame, SteamPlayer } from '@/types/steam'

const steamApiKey = import.meta.env.VITE_STEAM_API_KEY
const steamId = import.meta.env.VITE_STEAM_ID
const proxyPrefix = import.meta.env.VITE_STEAM_PROXY_PREFIX ?? 'https://corsproxy.io/?'

function getConfigValue(value: string | undefined, label: string): string {
  if (!value) {
    throw new Error(`${label} is missing. Check your .env file.`)
  }

  return value
}

function buildApiUrl(baseUrl: string): string {
  if (!proxyPrefix) {
    return baseUrl
  }

  return `${proxyPrefix}${encodeURIComponent(baseUrl)}`
}

async function fetchSteamApi<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const key = getConfigValue(steamApiKey, 'VITE_STEAM_API_KEY')
  const id = getConfigValue(steamId, 'VITE_STEAM_ID')

  const queryParams = new URLSearchParams({
    key,
    steamid: id,
    format: 'json',
    ...params,
  })

  const targetUrl = `https://api.steampowered.com/${endpoint}?${queryParams.toString()}`
  const response = await fetch(buildApiUrl(targetUrl))

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

  const key = getConfigValue(steamApiKey, 'VITE_STEAM_API_KEY')
  const targetUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?${new URLSearchParams({
    key,
    steamids: friendIds.join(','),
    format: 'json',
  }).toString()}`

  const response = await fetch(buildApiUrl(targetUrl))

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
