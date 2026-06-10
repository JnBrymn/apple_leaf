# Game Arcade

A browser game arcade for Bo Berryman. React + Vite frontend, TypeScript auth server (Hono).

**Games:** Snake, Game of Life (more in `src/games/`)

## Quick start

```bash
pnpm install
pnpm --dir server install
pnpm dev
```

Open http://localhost:18081

To play games (login required), also run the auth server in a second terminal:

```bash
pnpm dev:server
```

## Google login (not configured yet)

Games require Google sign-in. The lobby is public; `/games/*` is protected.

1. Copy `.env.example` → `.env`
2. Create a [Google OAuth client](https://console.cloud.google.com/) with redirect URI:
   - Dev: `http://localhost:18081/auth/google/callback`
3. Fill in `ARCADE_GOOGLE_CLIENT_ID`, `ARCADE_GOOGLE_CLIENT_SECRET`, and a 32+ char `ARCADE_SESSION_SECRET`
4. Run `pnpm dev` and `pnpm dev:server`, then sign in

Only `ARCADE_ALLOWED_USER_EMAIL` (default `jfberryman@gmail.com`) can play after OAuth.

## Scripts

| Command | What it does |
|---------|----------------|
| `pnpm dev` | Vite frontend on :18081 (proxies auth to :18080) |
| `pnpm dev:server` | Hono auth server on :18080 |
| `pnpm build` | Build frontend to `dist/` |
| `pnpm start` | Serve `dist/` + auth (production) |

## Project layout

```
src/
  arcade/     Lobby and game registry
  auth/       Login UI and route protection
  games/      One folder per game
  shared/     Hooks and fullscreen wrapper
server/       Hono + Google OAuth + sessions
dist/         Production frontend build
```

## Adding a game

1. Create `src/games/<game-id>/` (see `src/games/snake/` for an example)
2. Register it in `src/arcade/games.config.ts`
3. New games are automatically login-protected via `ProtectedRoute`

More detail for agents: [AGENTS.md](AGENTS.md)

## Production

```bash
pnpm build
ARCADE_PUBLIC_BASE_URL=https://your-domain.com pnpm start
```

Set the Google OAuth redirect URI to `https://your-domain.com/auth/google/callback`.

## Stack

- **Frontend:** React, Vite, React Router, CSS Modules
- **Server:** Hono, Arctic (Google OAuth), iron-session
