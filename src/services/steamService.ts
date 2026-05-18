/**
 * Steam Web API Service
 * Handles all Steam API calls including vanity URL resolution and player data fetching
 */

const proxyPrefix = import.meta.env.VITE_STEAM_PROXY_PREFIX ?? 'https://corsproxy.io/?'

/**
 * Custom error class for Steam API errors
 */
export class SteamApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly isPrivateProfile?: boolean,
  ) {
    super(message)
    this.name = 'SteamApiError'
  }
}

/**
 * Get the API key from environment, only when needed
 */
function getApiKey(): string {
  const apiKey = import.meta.env.VITE_STEAM_API_KEY
  if (!apiKey) {
    throw new SteamApiError('VITE_STEAM_API_KEY is missing. Check your .env file.')
  }
  return apiKey
}

/**
 * Build a proxied URL if needed (for CORS compatibility)
 */
function buildProxiedUrl(baseUrl: string): string {
  if (!proxyPrefix) {
    return baseUrl
  }
  return `${proxyPrefix}${encodeURIComponent(baseUrl)}`
}

/**
 * Generic fetch function for Steam API with error handling
 */
async function fetchSteamApi<T>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<T> {
  const apiKey = getApiKey()

  const queryParams = new URLSearchParams({
    key: apiKey,
    format: 'json',
    ...params,
  })

  const targetUrl = `https://api.steampowered.com/${endpoint}?${queryParams.toString()}`
  const proxiedUrl = buildProxiedUrl(targetUrl)

  try {
    const response = await fetch(proxiedUrl)

    if (!response.ok) {
      throw new SteamApiError(
        `Steam API request failed with status ${response.status}`,
        response.status,
      )
    }

    return (await response.json()) as T
  } catch (error) {
    if (error instanceof SteamApiError) {
      throw error
    }
    throw new SteamApiError(`Failed to fetch from Steam API: ${String(error)}`)
  }
}

/**
 * Resolve a Steam vanity URL to a SteamID64
 * @param vanityUrl - The vanity URL (e.g., "Mvtos")
 * @returns The SteamID64 as a string
 */
export async function resolveVanityUrl(vanityUrl: string): Promise<string> {
  if (!vanityUrl.trim()) {
    throw new SteamApiError('Vanity URL cannot be empty')
  }

  const data = await fetchSteamApi<{
    response: {
      steamid?: string
      success: number
      message?: string
    }
  }>('ISteamUser/ResolveVanityURL/v1/', {
    vanityurl: vanityUrl.trim(),
  })

  if (!data.response.steamid || data.response.success !== 1) {
    throw new SteamApiError(
      `Failed to resolve vanity URL "${vanityUrl}". ${data.response.message || 'User not found.'}`,
    )
  }

  return data.response.steamid
}

/**
 * Get player summary (avatar, status, display name)
 * @param steamId - The SteamID64
 * @returns Player summary with avatar, personaname, personastate, etc.
 */
export async function getPlayerSummary(steamId: string): Promise<{
  steamid: string
  personaname: string
  profileurl: string
  avatarfull: string
  personastate: number
  loccountrycode?: string
  timecreated?: number
} | null> {
  if (!steamId.trim()) {
    throw new SteamApiError('SteamID cannot be empty')
  }

  const data = await fetchSteamApi<{
    response: {
      players: Array<{
        steamid: string
        personaname: string
        profileurl: string
        avatarfull: string
        personastate: number
        loccountrycode?: string
        timecreated?: number
      }>
    }
  }>('ISteamUser/GetPlayerSummaries/v2/', {
    steamids: steamId,
  })

  // Check if array has elements before accessing index
  if (!data.response.players || data.response.players.length === 0) {
    return null
  }

  return data.response.players[0]!
}

/**
 * Get owned games with playtime
 * @param steamId - The SteamID64
 * @returns Array of owned games with playtime
 */
export async function getOwnedGames(steamId: string): Promise<
  Array<{
    appid: number
    name: string
    playtime_forever: number
    img_icon_url?: string
  }>
> {
  if (!steamId.trim()) {
    throw new SteamApiError('SteamID cannot be empty')
  }

  const data = await fetchSteamApi<{
    response: {
      game_count?: number
      games?: Array<{
        appid: number
        name: string
        playtime_forever: number
        img_icon_url?: string
      }>
    }
  }>('IPlayerService/GetOwnedGames/v1/', {
    steamid: steamId,
    include_appinfo: 'true',
    include_played_free_games: 'true',
  })

  return data.response.games ?? []
}

/**
 * Get recently played games (last 2 weeks)
 * @param steamId - The SteamID64
 * @returns Array of recently played games
 */
export async function getRecentlyPlayedGames(steamId: string): Promise<
  Array<{
    appid: number
    name: string
    playtime_2weeks?: number
    playtime_forever: number
  }>
> {
  if (!steamId.trim()) {
    throw new SteamApiError('SteamID cannot be empty')
  }

  const data = await fetchSteamApi<{
    response: {
      total_count?: number
      games?: Array<{
        appid: number
        name: string
        playtime_2weeks?: number
        playtime_forever: number
      }>
    }
  }>('IPlayerService/GetRecentlyPlayedGames/v1/', {
    steamid: steamId,
    count: '20',
  })

  return data.response.games ?? []
}

/**
 * Get Steam level
 * @param steamId - The SteamID64
 * @returns Steam level as a number
 */
export async function getSteamLevel(steamId: string): Promise<number> {
  if (!steamId.trim()) {
    throw new SteamApiError('SteamID cannot be empty')
  }

  const data = await fetchSteamApi<{
    response: {
      player_level?: number
    }
  }>('IPlayerService/GetSteamLevel/v1/', {
    steamid: steamId,
  })

  return data.response.player_level ?? 0
}
