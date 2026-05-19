# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # start dev server (Vite)
npm run build            # type-check + production build
npm run lint             # run Oxlint then ESLint (both with --fix)
npm run test:unit -- --run   # run unit tests once (no watch)
npm run test:unit        # run unit tests in watch mode
npm run preview          # preview production build locally
```

## Environment variables

Copy `.env.example` to `.env` before running locally:

```
VITE_STEAM_API_KEY=    # Steam Web API key
VITE_STEAM_ID=         # SteamID64 (17-digit number from the profile URL)
```

On Vercel, use `STEAM_API_KEY` (without `VITE_` prefix) so the key stays server-side only.

## Architecture

### Request flow

All Steam API calls go through a server-side proxy, never directly from the browser:

```
Browser → /api/steam?steamEndpoint=<path>&...params → api/steam.js → api.steampowered.com
```

`api/steam.js` is a Vercel Serverless Function. It reads the API key from `process.env.STEAM_API_KEY` (or `VITE_STEAM_API_KEY` as fallback), validates `steamEndpoint`, appends the key and `format=json`, then forwards the response.

In development, a Vite plugin in `vite.config.ts` intercepts `/api/steam` requests and calls the handler directly with a mock `req`/`res`, so no Vercel CLI is needed locally.

### Frontend layers

- **`src/services/steamApi.ts`** — all data-fetching. Most functions use the internal `fetchSteamApi()` helper, which injects `steamid` automatically. Three exceptions build requests manually:
  - `getPlayerSummary` — uses `steamids` (plural), required by `GetPlayerSummaries/v2`
  - `getPlayerAchievements` — handles HTTP 400 gracefully (returns `[]` when a game has no achievement stats)
  - `getFriendsSummary` — batches friend IDs in chunks of 100 to respect the Steam API limit
- **`src/composables/usePlayerSummary.ts`** — module-level cached promise for the player summary. `App.vue` and `ProfileView` both consume it so `getPlayerSummary` is only called once per page load.
- **`src/views/`** — one Vue component per route; fetches data on `onMounted` and owns its `loading`/`error` state.
- **`src/types/steam.ts`** — shared TypeScript interfaces for Steam API response shapes.
- **`src/utils/steamFormatters.ts`** — pure formatting helpers (playtime, dates, status label, sort/filter, icon URL). Unit-tested in `src/utils/__tests__/steamFormatters.spec.ts`.
- **`src/router/index.ts`** — four routes: `/profile`, `/library`, `/achievements`, `/friends` (root redirects to `/profile`).
- **`src/App.vue`** — sets the browser favicon dynamically from the Steam profile avatar via `usePlayerSummary`.

### Path alias

`@` maps to `src/` (configured in `vite.config.ts`).

### Linting

Two linters run in sequence: Oxlint first (`lint:oxlint`), then ESLint (`lint:eslint`). `eslint-plugin-oxlint` disables ESLint rules already covered by Oxlint to avoid conflicts. Both run with `--fix`.

### CI workflows

- **`ci.yml`** — runs on every push and PR: validates secrets, lint, unit tests, build.
- **`api-health.yml`** — runs daily at 08:00 UTC: calls live Steam endpoints with the stored secrets and checks responses. Triggered manually via `workflow_dispatch`.

### Deployment

Deployed on Vercel. `vercel.json` rewrites all non-`/api/` paths to `index.html` for SPA routing.
