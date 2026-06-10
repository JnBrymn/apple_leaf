import { serve } from '@hono/node-server'
import app from './app.js'
import { settings } from './settings.js'

serve(
  {
    fetch: app.fetch,
    hostname: '0.0.0.0',
    port: settings.port,
  },
  (info) => {
    console.log(`Arcade server listening on http://localhost:${info.port}`)
  },
)
