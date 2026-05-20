export interface SteamPlayer {
  steamid: string
  personaname: string
  profileurl: string
  avatarfull: string
  personastate: number
  loccountrycode?: string
  timecreated?: number
  personasummary?: string
  gameid?: string
  gameextrainfo?: string
}

export interface SteamOwnedGame {
  appid: number
  name: string
  playtime_forever: number
  img_icon_url?: string
  rtime_last_played?: number
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

export type LibrarySortOption = 'name-asc' | 'name-desc' | 'playtime-asc' | 'playtime-desc' | 'recent'

export interface SteamBadge {
  badgeid: number
  level: number
  completion_time: number
  xp: number
  scarcity: number
  appid?: number
  communityitemid?: string
  border_color?: number
}

export interface SteamRecentGame {
  appid: number
  name: string
  playtime_2weeks: number
  playtime_forever: number
  img_icon_url?: string
}

export interface SteamWishlistItem {
  appid: number
  priority: number
  date_added: number
}

export interface SteamScreenshot {
  publishedfileid: string
  title: string
  preview_url: string
  app_name: string
  time_created: number
  creator_appid?: number
}
