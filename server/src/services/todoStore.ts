import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { Todo, TodoStoreData } from '../types/todo'

const EMPTY: TodoStoreData = { todos: [] }

const DEFAULT_TODOS: Todo[] = [
  {
    id: 'td1',
    text: 'Prep notes for design review',
    priority: 'high',
    done: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'td2',
    text: 'Reply to Ana re: roadmap',
    priority: 'high',
    done: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'td3',
    text: 'Book flights for Copperkite offsite',
    priority: 'medium',
    done: false,
    createdAt: new Date().toISOString(),
  },
]

/** File-backed todo store — swap for DB later without changing callers. */
export class TodoStore {
  private readonly filePath: string
  private cache: TodoStoreData | null = null

  constructor(dataDir: string) {
    this.filePath = path.join(dataDir, 'todos.json')
  }

  async list(): Promise<Todo[]> {
    const data = await this.read()
    return data.todos
  }

  async replace(todos: Todo[]): Promise<void> {
    await this.write({ todos })
  }

  private async read(): Promise<TodoStoreData> {
    if (this.cache) return this.cache
    try {
      const raw = await readFile(this.filePath, 'utf8')
      this.cache = JSON.parse(raw) as TodoStoreData
      return this.cache
    } catch {
      this.cache = { todos: DEFAULT_TODOS.map((t) => ({ ...t })) }
      await this.write(this.cache)
      return this.cache
    }
  }

  private async write(data: TodoStoreData): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true })
    await writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf8')
    this.cache = data
  }
}
