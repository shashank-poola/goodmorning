import { serve } from '@hono/node-server'
import { createApp } from './app'
import { loadConfig } from './config'

const config = loadConfig()
const app = createApp(config)

serve(
  {
    fetch: app.fetch,
    port: config.port,
  },
  (info) => {
    console.log(`goodmorning-server listening on http://localhost:${info.port}`)
  },
).on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\nPort ${config.port} is already in use — another goodmorning-server is probably still running.\n` +
        `Use that instance, or stop it first:\n` +
        `  npx kill-port ${config.port}\n`,
    )
    process.exit(1)
  }
  throw err
})
