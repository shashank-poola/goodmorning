import { google } from 'googleapis'
import { AppError } from '../lib/errors'
import type { StoredAccount } from '../types/calendar'
import type { Email, EmailsResponse, Mailbox } from '../types/email'
import type { GoogleAccountsService } from './googleAccounts'

/**
 * Primary inbox only — explicitly excludes Gmail's automated categories so
 * only real human-sent mail shows (no OTPs, notifications, marketing).
 * is:important also catches starred/flagged threads.
 */
const INBOX_QUERY =
  'in:inbox category:primary -category:promotions -category:social -category:updates -category:forums'
const MAX_MESSAGES_PER_ACCOUNT = 10

export class GoogleGmailService {
  constructor(private readonly accounts: GoogleAccountsService) {}

  async getMergedEmails(): Promise<EmailsResponse> {
    const accountList = await this.accounts.requireAccounts()

    const mailboxes: Mailbox[] = accountList.map((a) => ({
      id: a.id,
      name: a.email,
      color: a.color,
    }))

    const emailGroups = await Promise.all(
      accountList.map((account) => this.fetchAccountEmails(account)),
    )

    const emails = emailGroups
      .flat()
      .sort((a, b) => Date.parse(b.receivedAt) - Date.parse(a.receivedAt))

    return { mailboxes, emails }
  }

  private async fetchAccountEmails(account: StoredAccount): Promise<Email[]> {
    const auth = await this.accounts.getAuthorizedClient(account)
    const gmail = google.gmail({ version: 'v1', auth })

    try {
      const { data: listData } = await gmail.users.messages.list({
        userId: 'me',
        q: INBOX_QUERY,
        maxResults: MAX_MESSAGES_PER_ACCOUNT,
      })

      const messageIds = (listData.messages ?? [])
        .map((m) => m.id)
        .filter((id): id is string => Boolean(id))

      if (messageIds.length === 0) return []

      const messages = await Promise.all(
        messageIds.map((id) =>
          gmail.users.messages.get({
            userId: 'me',
            id,
            format: 'metadata',
            metadataHeaders: ['From', 'Subject', 'Date'],
          }),
        ),
      )

      return messages
        .map(({ data }) => mapGmailMessage(account.id, data))
        .filter((email): email is Email => email !== null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gmail API error'
      throw new AppError(message, 502, 'google_gmail', { account: account.email })
    }
  }
}

type GmailMessage = {
  id?: string | null
  snippet?: string | null
  labelIds?: string[] | null
  payload?: {
    headers?: Array<{ name?: string | null; value?: string | null }> | null
  } | null
  internalDate?: string | null
}

function mapGmailMessage(mailboxId: string, msg: GmailMessage): Email | null {
  if (!msg.id) return null

  const headers = msg.payload?.headers ?? []
  const from = headerValue(headers, 'From') ?? 'Unknown'
  const subject = headerValue(headers, 'Subject') ?? '(no subject)'
  const dateHeader = headerValue(headers, 'Date')
  const receivedAt = parseEmailDate(dateHeader, msg.internalDate)

  const labelIds = msg.labelIds ?? []
  return {
    id: `${mailboxId}:${msg.id}`,
    mailboxId,
    sender: parseSenderName(from),
    subject,
    preview: msg.snippet ?? '',
    receivedAt,
    unread: labelIds.includes('UNREAD'),
    important: labelIds.includes('IMPORTANT'),
  }
}

function headerValue(
  headers: Array<{ name?: string | null; value?: string | null }>,
  name: string,
): string | undefined {
  const match = headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())
  return match?.value ?? undefined
}

/** "Ana Duarte <ana@example.com>" → "Ana Duarte" */
export function parseSenderName(from: string): string {
  const angle = from.indexOf('<')
  if (angle > 0) {
    const name = from.slice(0, angle).trim().replace(/^["']|["']$/g, '')
    if (name) return name
  }
  const at = from.indexOf('@')
  if (at > 0 && !from.includes('<')) return from.slice(0, at)
  return from.replace(/<[^>]+>/, '').trim() || from
}

function parseEmailDate(dateHeader?: string, internalDate?: string | null): string {
  if (dateHeader) {
    const parsed = Date.parse(dateHeader)
    if (!Number.isNaN(parsed)) return new Date(parsed).toISOString()
  }
  if (internalDate) {
    const ms = Number(internalDate)
    if (!Number.isNaN(ms)) return new Date(ms).toISOString()
  }
  return new Date().toISOString()
}
