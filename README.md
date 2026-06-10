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

To enable Google sign-in / backstage access, also run the auth server in a second terminal:

```bash
pnpm dev:server
```

## Google login (not configured yet)

Games are public. Google sign-in is only used for the protected `/backstage` area.

1. Copy `.env.example` → `.env`
2. Create a [Google OAuth client](https://console.cloud.google.com/) with redirect URI:
   - Dev: `http://localhost:18081/auth/google/callback`
3. Fill in `ARCADE_GOOGLE_CLIENT_ID`, `ARCADE_GOOGLE_CLIENT_SECRET`, and a 32+ char `ARCADE_SESSION_SECRET`
4. Run `pnpm dev` and `pnpm dev:server`, then sign in

Only emails listed in `ARCADE_ALLOWED_USER_EMAILS` can access `/backstage` after OAuth.

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
3. New games are public by default; use `ProtectedRoute` only for members-only pages like `/backstage`

More detail for agents: [AGENTS.md](AGENTS.md)

## Production

```bash
pnpm build
ARCADE_PUBLIC_BASE_URL=https://your-domain.com pnpm start
```

Set the Google OAuth redirect URI to `https://your-domain.com/auth/google/callback`.

## GitHub auto-deploy to a Mac

This repo includes:

- `.github/workflows/deploy.yml` — deploy on push to `main`
- `deploy/deploy.sh` — pull, install, build, restart
- `deploy/run-production.sh` — launchd entrypoint
- `deploy/com.appleleaf.arcade.plist.example` — launchd template

### One-time setup on the Mac

1. Clone this repo to a dedicated production directory.
2. Copy `.env.example` to `.env` and fill in production values.
3. Make the deploy scripts executable:
   ```bash
   chmod +x deploy/deploy.sh deploy/run-production.sh
   ```
4. Create a plist from the example:
   - replace `__APP_ROOT__` with the repo path
   - replace `__HOME__` with your macOS home directory
   - save it as `~/Library/LaunchAgents/com.appleleaf.arcade.plist`
5. Create the logs directory:
   ```bash
   mkdir -p logs
   ```
6. Load the service:
   ```bash
   launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.appleleaf.arcade.plist
   launchctl kickstart -k gui/$(id -u)/com.appleleaf.arcade
   ```

### GitHub secrets to add

- `APPLELEAF_DEPLOY_HOST`
- `APPLELEAF_DEPLOY_USER`
- `APPLELEAF_DEPLOY_PORT` (optional; defaults to `22`)
- `APPLELEAF_DEPLOY_PATH` (absolute path to the production repo on the Mac)
- `APPLELEAF_DEPLOY_SSH_KEY` (private key for SSHing into the Mac)
- `APPLELEAF_CLOUDFLARE_ACCESS_CLIENT_ID` (if your SSH tunnel is behind Cloudflare Access)
- `APPLELEAF_CLOUDFLARE_ACCESS_CLIENT_SECRET` (if your SSH tunnel is behind Cloudflare Access)

This workflow uses `cloudflared access tcp --hostname ...` to SSH through a Cloudflare Tunnel, matching a local SSH setup like `ProxyCommand cloudflared access tcp --hostname %h`.

After that, every push to `main` will SSH into the Mac and run `./deploy/deploy.sh`.

The workflow writes `APPLELEAF_DEPLOY_SSH_KEY` to a temporary key file on the GitHub runner and uses it as `IdentityFile` for SSH.

## Stack

- **Frontend:** React, Vite, React Router, CSS Modules
- **Server:** Hono, Arctic (Google OAuth), iron-session
