import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import type { Context } from 'hono'
import { sealData, unsealData } from 'iron-session'
import { settings } from './settings.js'

export type SessionData = {
  userEmail?: string
  nextUrl?: string
  oauthState?: string
  oauthCodeVerifier?: string
}

const cookieName = 'arcade_session'
const cookieOptions = {
  secure: settings.publicBaseUrl.startsWith('https://'),
  httpOnly: true,
  sameSite: 'Lax' as const,
  maxAge: 60 * 60 * 24 * 14,
  path: '/',
}

const sealOptions = {
  password: settings.sessionSecret,
  ttl: cookieOptions.maxAge,
}

export type ArcadeSession = SessionData & {
  save: () => Promise<void>
  destroy: () => void
}

export async function getSession(c: Context): Promise<ArcadeSession> {
  const sealed = getCookie(c, cookieName)
  const data: SessionData = sealed
    ? ((await unsealData(sealed, sealOptions)) as SessionData)
    : {}

  const session = data as ArcadeSession

  session.save = async () => {
    setCookie(c, cookieName, await sealData(data, sealOptions), cookieOptions)
  }

  session.destroy = () => {
    deleteCookie(c, cookieName, { path: '/' })
  }

  return session
}
