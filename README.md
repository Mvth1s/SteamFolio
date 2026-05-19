# SteamFolio

SteamFolio is a Vue 3 dashboard powered by the Steam Web API. It gives a quick overview of a Steam account with dedicated sections for profile, game library, achievements, and friends.

## Features

- **Profile overview** — avatar, username, online status, Steam level, country, account creation date
- **Game library** — owned games with icon and playtime, searchable and sortable
- **Achievements** — per-game achievements with completion percentage progress bar
- **Friends list** — friends with current status and direct links to their Steam profiles

## Tech stack

- Vue 3 + TypeScript
- Vue Router
- Tailwind CSS v4
- Vitest (unit tests)

## Getting started

### 1) Install dependencies

```bash
npm install
```

### 2) Get a Steam Web API key

1. Visit [https://steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey)
2. Log in with your Steam account and accept the Terms of Use
3. Copy your API key

> Your API key is personal — keep it in `.env` and never commit it.

### 3) Configure environment variables

```bash
cp .env.example .env
```

```env
VITE_STEAM_API_KEY=your_steam_web_api_key
VITE_STEAM_ID=your_steam_id64
```

> **Finding your SteamID64:** visit your profile on [steamcommunity.com](https://steamcommunity.com) and look at the URL — it ends with a 17-digit number. Tools like [steamid.io](https://steamid.io) can also convert a vanity URL to a SteamID64.

### 4) Run the app

```bash
npm run dev
```

Open the local URL shown by Vite. The Vite dev server handles `/api/steam` requests by running the Vercel handler directly, so no separate server is needed.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint then ESLint (both with `--fix`) |
| `npm run test:unit -- --run` | Run unit tests once |
| `npm run test:unit` | Run unit tests in watch mode |

## CI / CD

Two GitHub Actions workflows run automatically:

### `ci.yml` — runs on every push and pull request
- Validates that required secrets are present
- Installs dependencies, runs lint, unit tests, and build

### `api-health.yml` — runs daily at 08:00 UTC (and on demand)
Calls the live Steam API endpoints using the stored secrets and checks that each returns valid data. Useful to detect an expired API key or a broken endpoint before users do.

Required GitHub repository secrets for both workflows:

- `VITE_STEAM_API_KEY`
- `VITE_STEAM_ID`

## Deployment

The app is deployed on Vercel. On Vercel, set `STEAM_API_KEY` (without the `VITE_` prefix) as a server-side environment variable so the API key is never exposed in the client bundle.

`vercel.json` rewrites all non-`/api/` paths to `index.html` for SPA routing.

## Steam API endpoints used

All calls go through `api/steam.js` (Vercel Serverless Function), which appends the API key server-side.

| Endpoint | Purpose |
|---|---|
| `ISteamUser/GetPlayerSummaries/v2` | Avatar, username, status |
| `IPlayerService/GetSteamLevel/v1` | Steam account level |
| `IPlayerService/GetOwnedGames/v1` | Game library with playtime |
| `ISteamUserStats/GetPlayerAchievements/v1` | Per-game achievements |
| `ISteamUser/GetFriendList/v1` | Friend list |
| `ISteamUser/GetPlayerSummaries/v2` *(batched)* | Friend details (100 per request) |
