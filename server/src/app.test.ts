import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp } from './app'
import { loadTestConfig } from './config'

const tempDirs: string[] = []

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })))
})

async function makeApp() {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'gm-app-'))
  tempDirs.push(dir)
  const config = loadTestConfig({ dataDir: dir })
  return createApp(config)
}

describe('API routes', () => {
  it('GET /api/health returns ok', async () => {
    const app = await makeApp()
    const res = await app.request('/api/health')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, service: 'goodmorning-server' })
  })

  it('GET /api/auth/status returns disconnected when empty', async () => {
    const app = await makeApp()
    const res = await app.request('/api/auth/status')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ connected: false, user: null, accounts: [] })
  })

  it('GET /api/emails returns 401 when no accounts connected', async () => {
    const app = await makeApp()
    const res = await app.request('/api/emails')
    expect(res.status).toBe(401)
    const body = (await res.json()) as { authUrl?: string }
    expect(body.authUrl).toBe('/auth/google')
  })

  it('GET /api/calendar returns 401 when no accounts connected', async () => {
    const app = await makeApp()
    const res = await app.request('/api/calendar')
    expect(res.status).toBe(401)
    const body = (await res.json()) as { authUrl?: string }
    expect(body.authUrl).toBe('/auth/google')
  })
})
