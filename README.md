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

### 2) Get a Steam Web API Key

1. Visit [https://steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey)
2. Log in with your Steam account
3. Accept the Steam Web API Terms of Use
4. Choose an appropriate domain name (or use localhost)
5. Copy your API key

> **Note:** Your API key is personal and should never be shared. Keep it secure in your `.env` file.

### 3) Configure environment variables

Copy `.env.example` to `.env` and provide your values:

```bash
cp .env.example .env
```

Required variables:

```env
VITE_STEAM_API_KEY=your_steam_web_api_key
VITE_STEAM_VANITY_URL=your_steam_vanity_url
VITE_STEAM_ID=your_steam_id64
```

Optional:

```env
VITE_STEAM_PROXY_PREFIX=https://corsproxy.io/?
```

> `VITE_STEAM_PROXY_PREFIX` is used to avoid browser CORS restrictions when calling the Steam API directly from the client.
>
> **For VITE_STEAM_VANITY_URL**: Use only the username portion from your Steam profile URL. For example, if your profile URL is `https://steamcommunity.com/id/Mvtos`, use `Mvtos` (not `/id/Mvtos`).
>
> **To find your Steam Vanity URL**: Visit your Steam profile and look at the custom URL (usually in the format `/id/username`). Use only the `username` part.
>
> **To find your SteamID64**: Visit [https://steamcommunity.com/profiles/](https://steamcommunity.com/profiles/) or use the ResolveVanityURL endpoint with your vanity URL.

### 4) Run the app

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

- `ISteamUser/ResolveVanityURL/v1` – Resolve vanity URL to SteamID64
- `ISteamUser/GetPlayerSummaries/v2` – Get player summary (avatar, username, status)
- `IPlayerService/GetOwnedGames/v1` – Get owned games with playtime
- `IPlayerService/GetRecentlyPlayedGames/v1` – Get recently played games
- `IPlayerService/GetSteamLevel/v1` – Get Steam account level
- `ISteamUserStats/GetPlayerAchievements/v1` – Get player achievements
- `ISteamUser/GetFriendList/v1` – Get friend list
