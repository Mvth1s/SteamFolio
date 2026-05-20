// SteamFolio mock data — converted from data.js

export interface SFUser {
  handle: string
  realName: string
  country: string
  countryName: string
  member: string
  level: number
  xp: number
  status: string
  bio: string
  avatarSeed: string
}

export interface SFStats {
  gamesOwned: number
  dlcOwned: number
  totalHours: number
  weeklyAvg: number
  achievementRate: number
  achievementCount: number
  achievementTotal: number
}

export interface SFGenre {
  name: string
  hours: number
  color: string
}

export interface SFWeekDay {
  d: string
  h: number
  peak: boolean
}

export interface SFFeatured {
  name: string
  coverHue: number
  coverHue2: number
  hours: number
  achievements: string
  lastPlayed: string
  status: string
}

export interface SFRecentGame {
  name: string
  mins: number
  when: string
  hue: number
  hue2: number
}

export interface SFSession {
  isLive: boolean
  game: string
  hue: number
  hue2: number
  startedAt: number
  last: { mins: number; when: string }
}

export interface SFTopGame {
  name: string
  hours: number
  hue: number
  hue2: number
}

export interface SFFriendLocation {
  x: number
  y: number
  label: string
}

export interface SFStudio {
  name: string
  games: string[]
}

export interface SFRarest {
  title: string
  game: string
  rarity: number
  unlocked: string
  description: string
}

export interface SFLibraryGame {
  name: string
  hours: number
  lastPlayed: string
  genre: string
  hue: number
  hue2: number
}

export interface SFAchievementGame {
  game: string
  total: number
  got: number
  hue: number
  hue2: number
}

export interface SFFriend {
  name: string
  status: string
  state: 'online' | 'in-game' | 'away' | 'off'
  seed: string
  last: string | null
}

export interface SFData {
  user: SFUser
  stats: SFStats
  genres: SFGenre[]
  weekly: SFWeekDay[]
  featured: SFFeatured
  recent: SFRecentGame[]
  currentSession: SFSession
  topByPeriod: { month: SFTopGame[]; year: SFTopGame[]; alltime: SFTopGame[] }
  friendLocations: SFFriendLocation[]
  studios: SFStudio[]
  rarest: SFRarest
  library: SFLibraryGame[]
  achievements: SFAchievementGame[]
  friends: SFFriend[]
}

export const SF_DATA: SFData = {
  user: {
    handle: 'PixelDrifter',
    realName: 'Avery K.',
    country: 'PT',
    countryName: 'Portugal',
    member: 'Member since Sep 2014',
    level: 47,
    xp: 0.62,
    status: 'online',
    bio: 'Indie completionist · CRPG enjoyer · plays at 144fps, lives at 30fps. Currently grinding for the platinum on Hollow Knight (again).',
    avatarSeed: 'pixeldrifter-blue',
  },

  stats: {
    gamesOwned: 412,
    dlcOwned: 87,
    totalHours: 3127,
    weeklyAvg: 9.4,
    achievementRate: 0.378,
    achievementCount: 2841,
    achievementTotal: 7510,
  },

  genres: [
    { name: 'RPG',        hours: 612,  color: '#66c0f4' },
    { name: 'Indie',      hours: 504,  color: '#f3a847' },
    { name: 'Strategy',   hours: 388,  color: '#b389ff' },
    { name: 'Action',     hours: 295,  color: '#5ee37d' },
    { name: 'Simulation', hours: 211,  color: '#ff7aa2' },
    { name: 'Other',      hours: 1117, color: '#3d6e8e' },
  ],

  weekly: [
    { d: 'MON', h: 1.4, peak: false },
    { d: 'TUE', h: 0.6, peak: false },
    { d: 'WED', h: 2.1, peak: false },
    { d: 'THU', h: 1.0, peak: false },
    { d: 'FRI', h: 3.8, peak: false },
    { d: 'SAT', h: 6.2, peak: true  },
    { d: 'SUN', h: 4.7, peak: false },
  ],

  featured: {
    name: 'Stardew Valley',
    coverHue: 130,
    coverHue2: 40,
    hours: 412,
    achievements: '38/40',
    lastPlayed: 'Yesterday',
    status: 'Currently Playing',
  },

  recent: [
    { name: 'Stardew Valley',        mins: 142, when: 'Yesterday · 21:14', hue: 130, hue2: 40  },
    { name: 'Disco Elysium',          mins: 96,  when: '2 days ago',        hue: 24,  hue2: 360 },
    { name: 'Slay the Spire',         mins: 48,  when: '3 days ago',        hue: 0,   hue2: 30  },
    { name: 'Hollow Knight',          mins: 211, when: '5 days ago',        hue: 220, hue2: 250 },
    { name: 'Baldur’s Gate 3',   mins: 178, when: '6 days ago',        hue: 18,  hue2: 50  },
    { name: 'Inscryption',            mins: 72,  when: '1 wk ago',          hue: 80,  hue2: 30  },
  ],

  currentSession: {
    isLive: true,
    game: 'Stardew Valley',
    hue: 130,
    hue2: 40,
    startedAt: Date.now() - 1000 * 60 * 47,
    last: { mins: 142, when: 'Yesterday · 21:14' },
  },

  topByPeriod: {
    month: [
      { name: 'Stardew Valley',    hours: 42,  hue: 130, hue2: 40  },
      { name: 'Disco Elysium',     hours: 31,  hue: 24,  hue2: 360 },
      { name: 'Slay the Spire',    hours: 24,  hue: 0,   hue2: 30  },
    ],
    year: [
      { name: 'Baldur’s Gate 3', hours: 246, hue: 18,  hue2: 50  },
      { name: 'Stardew Valley',        hours: 212, hue: 130, hue2: 40  },
      { name: 'Hollow Knight',         hours: 188, hue: 220, hue2: 250 },
    ],
    alltime: [
      { name: 'Stardew Valley', hours: 412, hue: 130, hue2: 40  },
      { name: 'Terraria',       hours: 308, hue: 95,  hue2: 200 },
      { name: 'Hollow Knight',  hours: 287, hue: 220, hue2: 250 },
    ],
  },

  friendLocations: [
    { x: 14, y: 5, label: 'kestrel · Berlin'         },
    { x: 13, y: 5, label: 'mothbyte · Lisbon'         },
    { x: 15, y: 4, label: 'tinyswordsman · Helsinki'  },
    { x: 7,  y: 5, label: 'GLaDOS_fan · Chicago'      },
    { x: 9,  y: 7, label: 'noctilucent · São Paulo'   },
    { x: 23, y: 6, label: 'pixelpilot · Seoul'        },
    { x: 22, y: 7, label: 'baalbearings · Manila'     },
    { x: 14, y: 4, label: 'fjordwalker · Oslo'        },
    { x: 25, y: 9, label: 'minmaxine · Melbourne'     },
  ],

  studios: [
    { name: 'ConcernedApe',       games: ['Stardew Valley']           },
    { name: 'Team Cherry',         games: ['Hollow Knight']             },
    { name: 'Larian Studios',      games: ['Baldur’s Gate 3']      },
    { name: 'ZA/UM',               games: ['Disco Elysium']             },
    { name: 'Mega Crit',           games: ['Slay the Spire']            },
    { name: 'Wube Software',       games: ['Factorio']                  },
    { name: 'Supergiant Games',    games: ['Hades']                     },
    { name: 'Extremely OK Games',  games: ['Celeste']                   },
    { name: 'Mobius Digital',      games: ['Outer Wilds']               },
    { name: 'Daniel Mullins Games',games: ['Inscryption']               },
  ],

  rarest: {
    title: 'A True Vessel',
    game: 'Hollow Knight',
    rarity: 1.4,
    unlocked: 'Apr 12, 2026',
    description: 'Completed all Pantheons on Radiant difficulty.',
  },

  library: [
    { name: 'Stardew Valley',       hours: 412, lastPlayed: 'Yesterday',  genre: 'Simulation', hue: 130, hue2: 40  },
    { name: 'Hollow Knight',         hours: 287, lastPlayed: '5d ago',      genre: 'Indie',      hue: 220, hue2: 250 },
    { name: 'Baldur’s Gate 3',  hours: 246, lastPlayed: '6d ago',      genre: 'RPG',        hue: 18,  hue2: 50  },
    { name: 'Disco Elysium',         hours: 138, lastPlayed: '2d ago',      genre: 'RPG',        hue: 24,  hue2: 360 },
    { name: 'Slay the Spire',        hours: 124, lastPlayed: '3d ago',      genre: 'Strategy',   hue: 0,   hue2: 30  },
    { name: 'Factorio',              hours: 211, lastPlayed: '2 wk ago',    genre: 'Strategy',   hue: 25,  hue2: 8   },
    { name: 'Hades',                 hours: 96,  lastPlayed: '3 wk ago',    genre: 'Action',     hue: 350, hue2: 18  },
    { name: 'Celeste',               hours: 47,  lastPlayed: '1 mo ago',    genre: 'Indie',      hue: 290, hue2: 200 },
    { name: 'Outer Wilds',           hours: 32,  lastPlayed: '2 mo ago',    genre: 'Adventure',  hue: 32,  hue2: 200 },
    { name: 'Inscryption',           hours: 22,  lastPlayed: '1 wk ago',    genre: 'Indie',      hue: 80,  hue2: 30  },
    { name: 'Risk of Rain 2',        hours: 64,  lastPlayed: '2 mo ago',    genre: 'Action',     hue: 200, hue2: 280 },
    { name: 'Terraria',              hours: 308, lastPlayed: '4 mo ago',    genre: 'Sandbox',    hue: 95,  hue2: 200 },
    { name: 'Vampire Survivors',     hours: 41,  lastPlayed: '1 wk ago',    genre: 'Action',     hue: 280, hue2: 0   },
    { name: 'Tunic',                 hours: 18,  lastPlayed: '3 mo ago',    genre: 'Adventure',  hue: 35,  hue2: 90  },
    { name: 'Sea of Stars',          hours: 26,  lastPlayed: '2 mo ago',    genre: 'RPG',        hue: 200, hue2: 290 },
    { name: 'Cult of the Lamb',      hours: 38,  lastPlayed: '6 wk ago',    genre: 'Action',     hue: 320, hue2: 0   },
  ],

  achievements: [
    { game: 'Hollow Knight',    total: 63, got: 58, hue: 220, hue2: 250 },
    { game: 'Stardew Valley',   total: 40, got: 38, hue: 130, hue2: 40  },
    { game: 'Disco Elysium',    total: 60, got: 22, hue: 24,  hue2: 360 },
    { game: 'Slay the Spire',   total: 50, got: 41, hue: 0,   hue2: 30  },
    { game: 'Celeste',          total: 32, got: 12, hue: 290, hue2: 200 },
    { game: 'Hades',            total: 49, got: 35, hue: 350, hue2: 18  },
  ],

  friends: [
    { name: 'kestrel',        status: 'In-Game · Disco Elysium',  state: 'in-game', seed: 'kestrel-red',   last: null },
    { name: 'mothbyte',       status: 'Online',                   state: 'online',  seed: 'moth-purple',    last: null },
    { name: 'tinyswordsman',  status: 'In-Game · Hollow Knight',  state: 'in-game', seed: 'tiny-green',     last: null },
    { name: 'GLaDOS_fan',     status: 'Away · 23 min',            state: 'away',    seed: 'glados-orange',  last: null },
    { name: 'noctilucent',    status: 'Online',                   state: 'online',  seed: 'noct-cyan',      last: null },
    { name: 'pixelpilot',     status: 'Last seen 2h ago',         state: 'off',     seed: 'pilot-yellow',   last: '2h' },
    { name: 'baalbearings',   status: 'Last seen 3d ago',         state: 'off',     seed: 'baal-magenta',   last: '3d' },
    { name: 'fjordwalker',    status: 'Last seen 1d ago',         state: 'off',     seed: 'fjord-teal',     last: '1d' },
    { name: 'minmaxine',      status: 'Online',                   state: 'online',  seed: 'minmax-lime',    last: null },
  ],
} as const
