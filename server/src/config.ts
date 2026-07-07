import 'dotenv/config'

export interface ServerConfig {
  port: number
  frontendUrl: string
  calendarTimezone: string
  google: {
    clientId: string
    clientSecret: string
    redirectUri: string
  }
  dataDir: string
}

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

/** Validated config — throws on boot if Google credentials are absent. */
export function loadConfig(): ServerConfig {
  return {
    port: Number(process.env.PORT ?? 3001),
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    calendarTimezone: process.env.CALENDAR_TIMEZONE ?? 'Europe/London',
    google: {
      clientId: required('GOOGLE_CLIENT_ID'),
      clientSecret: required('GOOGLE_CLIENT_SECRET'),
      redirectUri: required('GOOGLE_REDIRECT_URI'),
    },
    dataDir: process.env.DATA_DIR ?? '.data',
  }
}

/** Config for tests — supplies defaults without requiring a real .env file. */
export function loadTestConfig(overrides: Partial<ServerConfig> = {}): ServerConfig {
  return {
    port: 3001,
    frontendUrl: 'http://localhost:5173',
    calendarTimezone: 'Europe/London',
    google: {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      redirectUri: 'http://localhost:3001/auth/google/callback',
    },
    dataDir: '.data-test',
    ...overrides,
  }
}
