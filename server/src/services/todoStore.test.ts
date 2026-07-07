import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { TodoStore } from './todoStore'

const tempDirs: string[] = []

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })))
})

async function makeStore() {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'gm-todos-'))
  tempDirs.push(dir)
  return new TodoStore(dir)
}

describe('TodoStore', () => {
  it('seeds default todos on first read', async () => {
    const store = await makeStore()
    const todos = await store.list()
    expect(todos.length).toBeGreaterThan(0)
    expect(todos.some((t) => t.text.includes('design review'))).toBe(true)
  })

  it('persists replacements across reads', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'gm-todos-'))
    tempDirs.push(dir)

    const store = new TodoStore(dir)
    const initial = await store.list()
    const updated = [{ ...initial[0]!, done: true }, ...initial.slice(1)]
    await store.replace(updated)

    const reloaded = new TodoStore(dir)
    const todos = await reloaded.list()
    expect(todos[0]!.done).toBe(true)
  })
})
