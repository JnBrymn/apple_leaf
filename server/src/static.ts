import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import type { Context } from 'hono'
import { settings } from './settings.js'

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function contentType(filePath: string): string {
  const ext = filePath.slice(filePath.lastIndexOf('.'))
  return MIME_TYPES[ext] ?? 'application/octet-stream'
}

function readDistFile(relativePath: string): Buffer | null {
  const filePath = join(settings.distDir, relativePath)
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    return null
  }
  return readFileSync(filePath)
}

export function serveAssets(c: Context) {
  const relativePath = c.req.path.replace(/^\//, '')
  const body = readDistFile(relativePath)
  if (!body) {
    return c.notFound()
  }
  c.header('Content-Type', contentType(relativePath))
  return c.body(new Uint8Array(body))
}

export function serveSpa(c: Context) {
  const path = c.req.path.replace(/^\//, '')
  if (path.startsWith('api/') || path.startsWith('auth/')) {
    return c.notFound()
  }

  if (path) {
    const file = readDistFile(path)
    if (file) {
      c.header('Content-Type', contentType(path))
      return c.body(new Uint8Array(file))
    }
  }

  const index = readDistFile('index.html')
  if (!index) {
    return c.text('Build the frontend with pnpm build first.', 503)
  }

  c.header('Content-Type', 'text/html; charset=utf-8')
  return c.body(new Uint8Array(index))
}
