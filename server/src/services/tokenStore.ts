import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { StoredAccount, TokenStoreData } from '../types/calendar'

const EMPTY: TokenStoreData = { accounts: [] }

/**
 * Simple file-backed store for OAuth refresh tokens.
 * v1: JSON on disk. Production: swap for encrypted DB without changing callers.
 */
export class TokenStore {
  private readonly filePath: string
  private cache: TokenStoreData | null = null

  constructor(dataDir: string) {
    this.filePath = path.join(dataDir, 'tokens.json')
  }

  async listAccounts(): Promise<StoredAccount[]> {
    const data = await this.read()
    return data.accounts
  }

  async getAccount(id: string): Promise<StoredAccount | undefined> {
    const data = await this.read()
    return data.accounts.find((a) => a.id === id)
  }

  async upsertAccount(account: StoredAccount): Promise<void> {
    const data = await this.read()
    const idx = data.accounts.findIndex((a) => a.id === account.id)
    if (idx >= 0) {
      data.accounts[idx] = account
    } else {
      data.accounts.push(account)
    }
    await this.write(data)
  }

  async updateTokens(id: string, tokens: StoredAccount['tokens']): Promise<void> {
    const data = await this.read()
    const account = data.accounts.find((a) => a.id === id)
    if (!account) return
    account.tokens = { ...account.tokens, ...tokens }
    await this.write(data)
  }

  private async read(): Promise<TokenStoreData> {
    if (this.cache) return this.cache
    try {
      const raw = await readFile(this.filePath, 'utf8')
      this.cache = JSON.parse(raw) as TokenStoreData
      return this.cache
    } catch {
      this.cache = structuredClone(EMPTY)
      return this.cache
    }
  }

  private async write(data: TokenStoreData): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true })
    await writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf8')
    this.cache = data
  }
}
