export interface SteamPlayer {
  steamid: string
  personaname: string
  profileurl: string
  avatarfull: string
  personastate: number
  loccountrycode?: string
  timecreated?: number
  personasummary?: string
}

export interface SteamOwnedGame {
  appid: number
  name: string
  playtime_forever: number
  img_icon_url?: string
}

export interface SteamFriend {
  steamid: string
  relationship: string
  friend_since: number
}

export interface SteamAchievement {
  apiname: string
  achieved: 0 | 1
  unlocktime: number
  name?: string
  description?: string
  icon?: string
  icongray?: string
}

export type LibrarySortOption = 'name-asc' | 'name-desc' | 'playtime-asc' | 'playtime-desc'

export interface SteamRecentGame {
  appid: number
  name: string
  playtime_2weeks: number
  playtime_forever: number
  img_icon_url?: string
}
