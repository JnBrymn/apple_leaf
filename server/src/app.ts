import { Hono } from 'hono'
import { handleAuthCallback, handleLogin, handleLogout, handleMe } from './auth.js'
import { settings } from './settings.js'
import { serveAssets, serveSpa } from './static.js'

const app = new Hono()

app.get('/health', (c) =>
  c.json({
    status: 'ok',
    publicBaseUrl: settings.publicBaseUrl,
    oauthCallback: `${settings.publicBaseUrl.replace(/\/$/, '')}/auth/google/callback`,
  }),
)
app.get('/api/me', handleMe)
app.get('/login', handleLogin)
app.get('/auth/google/callback', handleAuthCallback)
app.get('/logout', handleLogout)

app.get('/assets/*', serveAssets)
app.get('/', serveSpa)
app.get('/*', serveSpa)

export default app
