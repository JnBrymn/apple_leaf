import { Google, generateCodeVerifier, generateState } from 'arctic'
import type { Context } from 'hono'
import { callbackUrl, isAllowedEmail, isAuthConfigured, settings } from './settings.js'
import { getSession } from './session.js'

const scopes = ['openid', 'email', 'profile']

function googleClient() {
  return new Google(
    settings.googleClientId,
    settings.googleClientSecret,
    callbackUrl(),
  )
}

function loginNotConfiguredHtml() {
  return '<h1>Login not configured</h1><p>Set ARCADE_GOOGLE_CLIENT_ID and ARCADE_GOOGLE_CLIENT_SECRET.</p>'
}

function accessDeniedHtml() {
  return (
    '<h1>Access denied</h1>' +
    '<p>This Google account is not allowed to play.</p>' +
    '<p><a href="/logout">Sign out</a></p>'
  )
}

function logoutHtml() {
  return (
    '<!DOCTYPE html>' +
    '<html lang="en">' +
    '<head><meta charset="utf-8"><title>Signed out</title>' +
    '<style>body{font-family:system-ui,sans-serif;background:#0f0f1a;color:#e8e8f0;' +
    'display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;}' +
    '.card{background:#1a1a2e;border:1px solid #2a2a45;border-radius:12px;padding:2rem;' +
    'max-width:420px;text-align:center;}' +
    'a{color:#7c6cff;}</style></head>' +
    '<body><div class="card"><h1>Signed out</h1>' +
    '<p>You have been signed out of Game Arcade.</p>' +
    '<p><a href="/">Back to the arcade</a></p></div></body></html>'
  )
}

async function fetchGoogleEmail(accessToken: string): Promise<string> {
  const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Could not load Google profile')
  }

  const profile = (await response.json()) as { email?: string }
  return (profile.email ?? '').toLowerCase()
}

export async function handleLogin(c: Context) {
  if (!isAuthConfigured()) {
    return c.html(loginNotConfiguredHtml(), 503)
  }

  const next = c.req.query('next') ?? '/'
  const safeNext = next.startsWith('/') ? next : '/'

  const session = await getSession(c)
  const state = generateState()
  const codeVerifier = generateCodeVerifier()
  session.nextUrl = safeNext
  session.oauthState = state
  session.oauthCodeVerifier = codeVerifier
  await session.save()

  const url = googleClient().createAuthorizationURL(state, codeVerifier, scopes)
  return c.redirect(url.toString())
}

export async function handleAuthCallback(c: Context) {
  if (!isAuthConfigured()) {
    return c.html(loginNotConfiguredHtml(), 503)
  }

  const session = await getSession(c)
  const code = c.req.query('code')
  const state = c.req.query('state')

  if (!code || !state || !session.oauthState || !session.oauthCodeVerifier) {
    return c.text('Invalid OAuth response', 400)
  }

  if (state !== session.oauthState) {
    return c.text('Invalid OAuth state', 400)
  }

  const codeVerifier = session.oauthCodeVerifier
  session.oauthState = undefined
  session.oauthCodeVerifier = undefined

  try {
    const tokens = await googleClient().validateAuthorizationCode(code, codeVerifier)
    const email = await fetchGoogleEmail(tokens.accessToken())

    if (!isAllowedEmail(email)) {
      session.destroy()
      await session.save()
      return c.html(accessDeniedHtml(), 403)
    }

    session.userEmail = email
    const nextUrl = session.nextUrl ?? '/'
    session.nextUrl = undefined
    await session.save()

    return c.redirect(nextUrl)
  } catch {
    return c.text('Google sign-in failed', 500)
  }
}

export async function handleLogout(c: Context) {
  const session = await getSession(c)
  session.destroy()
  await session.save()
  return c.html(logoutHtml())
}

export async function handleMe(c: Context) {
  const session = await getSession(c)

  if (!session.userEmail) {
    return c.json({ detail: 'Not signed in' }, 401)
  }

  return c.json({ email: session.userEmail })
}
