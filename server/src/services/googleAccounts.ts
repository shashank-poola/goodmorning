import { google } from 'googleapis'
import type { OAuth2Client } from 'google-auth-library'
import type { ServerConfig } from '../config'
import { accountIdFromSub, colorForEmail } from '../lib/colors'
import { AppError } from '../lib/errors'
import type { StoredAccount, StoredGoogleTokens } from '../types/calendar'
import { TokenStore } from './tokenStore'

/** Scopes requested once at connect — calendar + gmail + profile. */
export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
]

/**
 * Shared Google OAuth + token lifecycle for all Google-backed subsystems.
 * Calendar and Gmail services depend on this — never duplicate OAuth logic.
 */
export class GoogleAccountsService {
  private readonly tokenStore: TokenStore

  constructor(private readonly config: ServerConfig) {
    this.tokenStore = new TokenStore(config.dataDir)
  }

  getAuthUrl(): string {
    return this.oauthClient().generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: GOOGLE_SCOPES,
    })
  }

  async handleCallback(code: string): Promise<StoredAccount> {
    const client = this.oauthClient()
    const { tokens } = await client.getToken(code)
    client.setCredentials(asGoogleCredentials(tokens))

    const oauth2 = google.oauth2({ version: 'v2', auth: client })
    const { data: profile } = await oauth2.userinfo.get()
    if (!profile.email || !profile.id) {
      throw new AppError('Google profile missing email or id', 502, 'google_profile')
    }

    const account: StoredAccount = {
      id: accountIdFromSub(profile.id),
      email: profile.email,
      name: profile.name ?? profile.email.split('@')[0] ?? profile.email,
      sub: profile.id,
      color: colorForEmail(profile.email),
      tokens,
      connectedAt: new Date().toISOString(),
    }

    const existing = await this.tokenStore.getAccount(account.id)
    if (existing?.tokens.refresh_token && !tokens.refresh_token) {
      account.tokens.refresh_token = existing.tokens.refresh_token
    }
    if (existing?.name && !profile.name) {
      account.name = existing.name
    }

    await this.tokenStore.upsertAccount(account)
    return account
  }

  async listAccounts(): Promise<StoredAccount[]> {
    return this.tokenStore.listAccounts()
  }

  /** Returns accounts or throws 401 with authUrl — use in data endpoints. */
  async requireAccounts(): Promise<StoredAccount[]> {
    const accounts = await this.listAccounts()
    if (accounts.length === 0) {
      throw new AppError('No Google accounts connected', 401, 'not_connected', {
        authUrl: '/auth/google',
      })
    }
    return accounts
  }

  async getAuthorizedClient(account: StoredAccount): Promise<OAuth2Client> {
    const client = this.oauthClient()
    client.setCredentials(asGoogleCredentials(account.tokens))
    const fresh = await this.ensureFreshTokens(client, account)
    client.setCredentials(asGoogleCredentials(fresh))
    return client
  }

  private async ensureFreshTokens(
    client: OAuth2Client,
    account: StoredAccount,
  ): Promise<StoredGoogleTokens> {
    const expiry = account.tokens.expiry_date ?? 0
    const needsRefresh = !account.tokens.access_token || Date.now() >= expiry - 60_000

    if (!needsRefresh) return account.tokens
    if (!account.tokens.refresh_token) {
      throw new AppError(`Reconnect required for ${account.email}`, 401, 'token_expired', {
        authUrl: '/auth/google',
      })
    }

    const { credentials } = await client.refreshAccessToken()
    const merged = { ...account.tokens, ...credentials }
    await this.tokenStore.updateTokens(account.id, merged)
    return merged
  }

  private oauthClient(): OAuth2Client {
    return new google.auth.OAuth2(
      this.config.google.clientId,
      this.config.google.clientSecret,
      this.config.google.redirectUri,
    )
  }
}

/** Strip nulls so googleapis Credentials type is satisfied. */
export function asGoogleCredentials(tokens: StoredGoogleTokens) {
  return {
    access_token: tokens.access_token ?? undefined,
    refresh_token: tokens.refresh_token ?? undefined,
    expiry_date: tokens.expiry_date ?? undefined,
    token_type: tokens.token_type ?? undefined,
    scope: tokens.scope,
  }
}
