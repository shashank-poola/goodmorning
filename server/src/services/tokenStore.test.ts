import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import type { StoredAccount } from '../types/calendar'
import { TokenStore } from './tokenStore'

const tempDirs: string[] = []

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })))
})

async function makeStore() {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'gm-tokens-'))
  tempDirs.push(dir)
  return new TokenStore(dir)
}

const sampleAccount = (): StoredAccount => ({
  id: 'google-abc',
  email: 'work@gmail.com',
  name: 'Work Account',
  sub: 'abc',
  color: 'gold',
  tokens: { access_token: 'at', refresh_token: 'rt', expiry_date: Date.now() + 3600_000 },
  connectedAt: new Date().toISOString(),
})

describe('TokenStore', () => {
  it('starts empty', async () => {
    const store = await makeStore()
    expect(await store.listAccounts()).toEqual([])
  })

  it('upserts and retrieves accounts', async () => {
    const store = await makeStore()
    const account = sampleAccount()
    await store.upsertAccount(account)

    const listed = await store.listAccounts()
    expect(listed).toHaveLength(1)
    expect(listed[0].email).toBe('work@gmail.com')
  })

  it('updates tokens in place', async () => {
    const store = await makeStore()
    await store.upsertAccount(sampleAccount())
    await store.updateTokens('google-abc', { access_token: 'fresh' })

    const account = await store.getAccount('google-abc')
    expect(account?.tokens.access_token).toBe('fresh')
    expect(account?.tokens.refresh_token).toBe('rt')
  })
})
