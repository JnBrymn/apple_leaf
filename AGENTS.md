# Game Arcade — Agent Notes

Bo Berryman's browser game arcade. React/Vite frontend + TypeScript auth server. Games live under `src/games/` and are registered in `src/arcade/games.config.ts`.

## Next steps (Google login)

**Goal:** players must sign in with Google before playing any game. The lobby stays public so you can browse; `/games/*` is protected.

**Status:** scaffolding is in the repo (`server/`, `src/auth/`, Vite proxy, `ProtectedRoute`). Auth is **not live yet** until the steps below are done.

**Still to do:**

1. **Google Cloud OAuth app** — create credentials; add authorized redirect URI:
   - Dev: `http://localhost:5173/auth/google/callback`
   - Prod: `https://<your-domain>/auth/google/callback`
2. **`.env`** — copy `.env.example` → `.env`; fill `ARCADE_GOOGLE_CLIENT_ID`, `ARCADE_GOOGLE_CLIENT_SECRET`, and a long random `ARCADE_SESSION_SECRET` (32+ chars).
3. **Install server deps** — `pnpm --dir server install`
4. **Local smoke test** — run both `pnpm dev:server` and `pnpm dev`; sign in as `jfberryman@gmail.com`; open a game; sign out.
5. **Production deploy** — `pnpm build && pnpm start`; set `ARCADE_PUBLIC_BASE_URL` to the public HTTPS origin; put the server behind your reverse proxy/tunnel.
6. **Decide who can play** — today only `jfberryman@gmail.com` is allowed (`ARCADE_ALLOWED_USER_EMAIL`). Add Bo or others when ready.

**Design reference:** same pattern as the Arcturus forms app — server-side Google OAuth + signed session cookies; Google login alone is not enough; email must match an allowlist. See Auth architecture below.

Until `.env` is configured and both dev processes are running, games will redirect to `/login-required` but Google sign-in will fail.

## Project layout

```
src/
  arcade/          Lobby, game registry, shared lobby styles
  auth/            Google login UI + route protection
  games/<game-id>/ One folder per game (CSS modules, no global theme pollution)
  shared/          useGameLoop, useKeyboard, FullscreenWrapper
server/
  src/
    index.ts       Node entrypoint (@hono/node-server)
    app.ts         Route wiring
    auth.ts        Google OAuth + allowlist
    session.ts     iron-session cookie helpers
    settings.ts    ARCADE_* env config
    static.ts      Serves dist/ in production
  package.json     Server-only deps (Hono, Arctic, iron-session)
dist/              Vite build output (served by server in production)
```

Skills for games:
- **Best practices (read first):** `.cursor/skills/games-best-practices/SKILL.md` — architecture, modularization, 3D/AI patterns. **Always read before creating, extending, or refactoring a game.** When we learn something new on a game, add it to that skill.
- Port from legacy Apple Bobs: `.cursor/skills/port-from-apple-bobs/SKILL.md`
- Create new game from scratch: `.cursor/skills/create-arcade-game/SKILL.md` (if present)

## Backend stack (TypeScript)

| Piece | Library | Why |
|-------|---------|-----|
| HTTP framework | [Hono](https://hono.dev) | Small, TypeScript-first, same language as frontend |
| Node adapter | `@hono/node-server` | Runs locally and in production on Node |
| Google OAuth | [Arctic](https://arcticjs.dev) | Lightweight OAuth 2.0 / OIDC for Google |
| Sessions | [iron-session](https://github.com/vvo/iron-session) | Encrypted, signed cookie (like Starlette sessions) |
| Dev runner | `tsx watch` | No separate compile step during development |

**Why not Express/Fastify?** Both work fine. Hono is a better fit here: minimal boilerplate, native `Request`/`Response`, easy to grow if we add more API routes later.

**Why a separate `server/package.json`?** Keeps server deps isolated from the Vite frontend. Root scripts call into it with `pnpm --dir server`.

## Auth architecture (scaffolded — see Next steps)

Once configured, this is a **two-process** app in dev, **one-process** in prod.

| Layer | Role |
|-------|------|
| `server/src/auth.ts` | Google OAuth, email allowlist, login/logout |
| `server/src/session.ts` | Signed `arcade_session` cookie via iron-session |
| `src/auth/` | Frontend session check via `GET /api/me` |
| `vite.config.ts` | Dev proxy: `/api`, `/login`, `/logout`, `/auth`, `/health` → `:8000` |

Pattern matches the Arcturus forms app: Google login alone is **not** enough. After OAuth, the server checks `ARCADE_ALLOWED_USER_EMAIL` (default `jfberryman@gmail.com`). Other accounts get 403.

### Public vs protected

| Route | Auth |
|-------|------|
| `/` (lobby) | Public — browse games, sign in/out |
| `/login-required` | Public — “Sign in with Google” page |
| `/games/*` | **Protected** — requires valid session |
| `/login`, `/auth/google/callback`, `/logout` | Server-handled OAuth |
| `/api/me` | Returns `{ email }` or 401 |
| `/health` | Public health check |

New games added to `games.config.ts` are auto-wrapped in `ProtectedRoute` in `App.tsx`. Do not register game routes outside that wrapper unless intentionally making a game public.

### OAuth flow

1. User hits a protected route → `ProtectedRoute` redirects to `/login-required?next=...`
2. User clicks “Sign in with Google” → `GET /login?next=...`
3. Server stores `nextUrl`, OAuth `state`, and `codeVerifier` in session, redirects to Google
4. Google → `GET /auth/google/callback`
5. Server exchanges code, fetches Google userinfo email, checks allowlist
6. Allowed: `session.userEmail = email`, redirect to `nextUrl`
7. Denied: destroy session, 403 HTML

Callback URL is built from `ARCADE_PUBLIC_BASE_URL`, not the incoming request host:

```
{ARCADE_PUBLIC_BASE_URL}/auth/google/callback
```

### Session

- Cookie name: `arcade_session`
- Library: iron-session (encrypted with `ARCADE_SESSION_SECRET`, min 32 chars)
- `secure` cookie when `ARCADE_PUBLIC_BASE_URL` starts with `https://`
- Frontend always uses `fetch(..., { credentials: 'include' })` for `/api/me`

### Key frontend files

- `src/auth/AuthContext.tsx` — `AuthProvider`, `useAuth()`, calls `/api/me` on mount
- `src/auth/ProtectedRoute.tsx` — redirects unauthenticated users to `/login-required`
- `src/auth/LoginRequired.tsx` — links to `/login?next=...`
- `src/arcade/Lobby.tsx` — shows signed-in email + sign out link

Sign-in/out links use plain `<a href="/login">` and `<a href="/logout">` (full page navigation to server routes), not React Router.

## Environment

Copy `.env.example` → `.env` at repo root (or `server/.env`). Prefix: `ARCADE_`.

```env
ARCADE_GOOGLE_CLIENT_ID=
ARCADE_GOOGLE_CLIENT_SECRET=
ARCADE_SESSION_SECRET=replace-with-a-long-random-string
ARCADE_ALLOWED_USER_EMAIL=jfberryman@gmail.com
ARCADE_PUBLIC_BASE_URL=http://localhost:5173
ARCADE_PORT=8000
```

Google Cloud Console → Authorized redirect URI must match exactly:

- Dev: `http://localhost:5173/auth/google/callback`
- Prod: `https://<your-domain>/auth/google/callback` (and set `ARCADE_PUBLIC_BASE_URL` to that origin)

## Commands

```bash
pnpm install
pnpm --dir server install

# Dev — one command (preferred when Bo asks to run/open a game)
bash scripts/dev.sh              # lobby → http://localhost:18081/
bash scripts/dev.sh bomb-simulator # game  → http://localhost:18081/games/bomb-simulator
pnpm dev:go -- snake               # same via package script (note the --)

# Dev — manual (two terminals)
pnpm dev:server   # Hono on :18080 (tsx watch)
pnpm dev          # Vite on :18081, proxies auth to :18080

# Production
pnpm check          # fast: typecheck frontend + server
pnpm build          # full production build (check + vite build)
pnpm start          # Hono serves dist/ + auth on :18080
```

Override dev proxy target: `ARCADE_AUTH_PROXY_TARGET=http://localhost:18080`

### Catch errors before production

`pnpm dev` does **not** run the full TypeScript check. Broken code can look fine locally but fail `pnpm build` (what production uses).

| When | Command |
|------|---------|
| Quick check while coding | `pnpm typecheck` |
| Before publish / commit | `pnpm build` |
| On GitHub | **CI** workflow (`.github/workflows/ci.yml`) runs on every push/PR |
| Before deploy | **Deploy** workflow runs `verify` (same build) before SSH to production |

### Run a game on Bo's command

When Bo says **run**, **open**, or **play** a game locally, use `scripts/dev.sh`:

1. Look up the game **id** in `src/arcade/games.config.ts` (kebab-case, e.g. `bomb-simulator`).
2. Run: `bash scripts/dev.sh <game-id>`
3. The script installs deps if needed, starts both dev processes if not already running, and opens Chrome.

| Bo says | Command |
|---------|---------|
| "run bomb simulator" | `bash scripts/dev.sh bomb-simulator` |
| "open snake" | `bash scripts/dev.sh snake` |
| "start the arcade" / no game named | `bash scripts/dev.sh` |

Script: `scripts/dev.sh`. Env: `OPEN_URL` overrides the Chrome URL; `ARCADE_DEV_PORT` (default `18081`), `ARCADE_PORT` (default `18080`).

If the server is already up, the script skips restart and only opens Chrome.

### Publish to production

**Deploy path:** commit → push to `main` → GitHub **CI** + **Deploy** workflows. Deploy runs `pnpm build` on GitHub first (`verify` job); only if that passes does it SSH to production and run `deploy/deploy.sh`.

When Bo says **publish**, **save**, **save the game**, **commit**, **push**, **ship**, or **push to production** — treat that as a request to **commit all relevant changes and push to `main`** so production updates.

**Agent workflow:**

1. `git status`, `git diff`, `git log -5` — review what will ship.
2. **`pnpm build`** — must pass locally before commit. Fix TypeScript/build errors first.
3. Stage everything that belongs (game code, registry, scripts, AGENTS.md). **Never** commit `.env`, secrets, or credentials.
4. Write a clear commit message (1–2 sentences, focus on *why*).
5. Commit, then `git push origin main`.
6. Confirm push succeeded; CI and Deploy workflows run on GitHub. Deploy only reaches production if `verify` passes.

**Do not** force-push `main`. **Do not** commit unless Bo uses one of the trigger phrases above (or explicitly asks).

| Bo says | Action |
|---------|--------|
| "publish" / "push to production" / "ship it" | commit + push to `main` |
| "save the game" / "commit" | commit + push to `main` |
| "run snake" | `bash scripts/dev.sh snake` (local only, no push) |

## Production / reverse proxy

- Run `pnpm build && pnpm start` — single Node process serves static files and auth.
- Set `ARCADE_PUBLIC_BASE_URL` to the public HTTPS origin.
- OAuth callback URL sent to Google must match the configured public URL, not internal HTTP.

## Adding or changing auth behavior

**To allow more users:** change `ARCADE_ALLOWED_USER_EMAIL` or extend `isAllowedEmail()` in `server/src/settings.ts`.

**To protect the lobby too:** wrap the `/` route in `ProtectedRoute` in `App.tsx`.

**To add API routes that need auth:** read `session.userEmail` via `getSession(c)` in Hono; return 401 if missing.

**Do not** put Google client secret in frontend code. **Do not** trust client-side email checks for authorization.

## Game conventions

**Before game work:** read `.cursor/skills/games-best-practices/SKILL.md` and follow it. Update that skill when we learn new patterns (modular layout, AI, 3D, perf, etc.) so the whole arcade stays consistent.

- Each game: `src/games/<id>/` with `index.tsx`, `<Name>Game.tsx`, `<id>.module.css`
- Register in `src/arcade/games.config.ts`
- Per-game CSS modules only; lobby/global styles in `src/arcade/lobby.css` and `src/style.css`
- Shared hooks: `useGameLoop`, `useKeyboard`; wrap games in `FullscreenWrapper`
- Install game-specific libs with `pnpm add <pkg>` (per-game, not global unless shared)

## Common pitfalls

1. **Auth broken in dev** — both `pnpm dev` and `pnpm dev:server` must be running.
2. **Server deps missing** — run `pnpm --dir server install` after clone.
3. **OAuth redirect mismatch** — Google URI must equal `{ARCADE_PUBLIC_BASE_URL}/auth/google/callback`.
4. **Session not sent** — frontend fetches need `credentials: 'include'`; cookie is same-origin via Vite proxy in dev.
5. **Production without build** — `pnpm start` expects `dist/`; run `pnpm build` first.
6. **New game playable without login** — ensure route stays inside `ProtectedRoute` in `App.tsx`.
7. **Dev hides TypeScript errors** — run `pnpm build` before publish; `pnpm dev` alone is not enough.
