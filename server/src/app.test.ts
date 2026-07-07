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

  it('GET /api/news returns an array', async () => {
    const app = await makeApp()
    const res = await app.request('/api/news')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBe(true)
  })

  it('GET /api/repos returns an array', async () => {
    const app = await makeApp()
    const res = await app.request('/api/repos')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBe(true)
  })

  it('GET /api/tweets returns an array', async () => {
    const app = await makeApp()
    const res = await app.request('/api/tweets')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBe(true)
  })

  it('GET /api/todos returns seeded todos', async () => {
    const app = await makeApp()
    const res = await app.request('/api/todos')
    expect(res.status).toBe(200)
    const body = (await res.json()) as { text: string }[]
    expect(body.length).toBeGreaterThan(0)
  })

  it('POST /api/todos creates a todo', async () => {
    const app = await makeApp()
    const res = await app.request('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Ship tweets RSS' }),
    })
    expect(res.status).toBe(201)
    const body = (await res.json()) as { text: string; done: boolean }
    expect(body.text).toBe('Ship tweets RSS')
    expect(body.done).toBe(false)
  })

  it('PATCH /api/todos/:id toggles done state', async () => {
    const app = await makeApp()
    const listRes = await app.request('/api/todos')
    const todos = (await listRes.json()) as { id: string }[]
    const id = todos[0]!.id

    const res = await app.request(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: true }),
    })
    expect(res.status).toBe(200)
    expect((await res.json()) as { done: boolean }).toEqual(expect.objectContaining({ done: true }))
  })

  it('DELETE /api/todos/:id removes a todo', async () => {
    const app = await makeApp()
    const createRes = await app.request('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Temporary task' }),
    })
    const created = (await createRes.json()) as { id: string }

    const delRes = await app.request(`/api/todos/${created.id}`, { method: 'DELETE' })
    expect(delRes.status).toBe(204)

    const list = (await (await app.request('/api/todos')).json()) as { id: string }[]
    expect(list.some((t) => t.id === created.id)).toBe(false)
  })

  it('GET /api/yesterday-recap returns bullets', async () => {
    const app = await makeApp()
    const res = await app.request('/api/yesterday-recap')
    expect(res.status).toBe(200)
    const body = (await res.json()) as { bullets: string[] }
    expect(body.bullets.length).toBeGreaterThan(0)
  })

  it('GET /api/linkedin returns stats and messages', async () => {
    const app = await makeApp()
    const res = await app.request('/api/linkedin')
    expect(res.status).toBe(200)
    const body = (await res.json()) as { stats: { followersTotal: number }; messages: unknown[] }
    expect(body.stats.followersTotal).toBeGreaterThan(0)
    expect(body.messages.length).toBeGreaterThan(0)
  })

  it('GET /api/calendar returns 401 when no accounts connected', async () => {
    const app = await makeApp()
    const res = await app.request('/api/calendar')
    expect(res.status).toBe(401)
    const body = (await res.json()) as { authUrl?: string }
    expect(body.authUrl).toBe('/auth/google')
  })
})
