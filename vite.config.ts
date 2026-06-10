import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const devPort = Number(process.env.ARCADE_DEV_PORT ?? '18081')
const authPort = process.env.ARCADE_PORT ?? '18080'
const authProxyTarget =
  process.env.ARCADE_AUTH_PROXY_TARGET ?? `http://localhost:${authPort}`

export default defineConfig({
  plugins: [react()],
  server: {
    port: devPort,
    strictPort: true,
    proxy: {
      '/api': authProxyTarget,
      '/login': authProxyTarget,
      '/logout': authProxyTarget,
      '/auth': authProxyTarget,
      '/health': authProxyTarget,
    },
  },
})
