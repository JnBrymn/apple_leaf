import { config } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const serverDir = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(serverDir, '../..')

config({ path: resolve(rootDir, '.env') })
config({ path: resolve(serverDir, '../.env') })

function env(name: string, fallback = ''): string {
  return process.env[name] ?? fallback
}

export const settings = {
  googleClientId: env('ARCADE_GOOGLE_CLIENT_ID'),
  googleClientSecret: env('ARCADE_GOOGLE_CLIENT_SECRET'),
  sessionSecret: env(
    'ARCADE_SESSION_SECRET',
    'dev-only-change-me-use-a-real-secret-in-env-file',
  ),
  allowedUserEmail: env('ARCADE_ALLOWED_USER_EMAIL', 'jfberryman@gmail.com'),
  publicBaseUrl: env('ARCADE_PUBLIC_BASE_URL', 'http://localhost:18081'),
  port: Number(env('ARCADE_PORT', '18080')),
  distDir: resolve(rootDir, 'dist'),
}

export function callbackUrl(): string {
  return `${settings.publicBaseUrl.replace(/\/$/, '')}/auth/google/callback`
}

export function isAllowedEmail(email: string): boolean {
  return email.toLowerCase() === settings.allowedUserEmail.toLowerCase()
}

export function isAuthConfigured(): boolean {
  return Boolean(settings.googleClientId && settings.googleClientSecret)
}
