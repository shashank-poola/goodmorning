import type { AccentColor } from './calendar'

/** Mirrors src/data/types.ts — keep in sync when the contract changes. */
export interface Mailbox {
  id: string
  name: string
  color: AccentColor
}

export interface Email {
  id: string
  mailboxId: string
  sender: string
  subject: string
  preview: string
  receivedAt: string
  unread: boolean
}

export interface EmailsResponse {
  mailboxes: Mailbox[]
  emails: Email[]
}
