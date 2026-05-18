# SteamFolio

SteamFolio is a Vue 3 dashboard powered by the Steam Web API. It gives a quick overview of a Steam account with dedicated sections for profile, game library, achievements, and friends.

## Features

- **Profile overview**
  - Avatar, username, online status, country, account creation date
- **Game library**
  - Owned games list with icon + playtime
  - Search and sort options (name/playtime)
- **Achievements**
  - Per-game achievements list
  - Completion percentage progress bar
- **Friends list**
  - Friends with current status
  - Direct links to Steam profiles

## Tech stack

- Vue 3 + TypeScript
- Vue Router
- Tailwind CSS
- Vitest (unit tests)

## Getting started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Copy `.env.example` to `.env` and provide your values:

```bash
cp .env.example .env
```

Required variables:

```env
VITE_STEAM_API_KEY=your_steam_web_api_key
VITE_STEAM_ID=your_steam_id64
```

Optional:

```env
VITE_STEAM_PROXY_PREFIX=https://corsproxy.io/?
```

> `VITE_STEAM_PROXY_PREFIX` is used to avoid browser CORS restrictions when calling the Steam API directly from the client.

### 3) Run the app

```bash
npm run dev
```

Then open the local URL shown by Vite.

## Scripts

- `npm run dev` – start development server
- `npm run lint` – run Oxlint + ESLint
- `npm run test:unit -- --run` – run unit tests once
- `npm run build` – type-check and build for production
- `npm run preview` – preview production build

## Folder structure

```text
.
├── .env.example
├── src
│   ├── assets
│   │   └── main.css
│   ├── components
│   │   └── layout
│   │       └── NavBar.vue
│   ├── router
│   │   └── index.ts
│   ├── services
│   │   └── steamApi.ts
│   ├── types
│   │   └── steam.ts
│   ├── utils
│   │   ├── __tests__
│   │   │   └── steamFormatters.spec.ts
│   │   └── steamFormatters.ts
│   ├── views
│   │   ├── AchievementsView.vue
│   │   ├── FriendsView.vue
│   │   ├── LibraryView.vue
│   │   └── ProfileView.vue
│   ├── App.vue
│   └── main.ts
├── env.d.ts
└── vite.config.ts
```

## Steam API endpoints used

- `ISteamUser/GetPlayerSummaries/v2`
- `IPlayerService/GetOwnedGames/v1`
- `ISteamUserStats/GetPlayerAchievements/v1`
- `ISteamUser/GetFriendList/v1`
