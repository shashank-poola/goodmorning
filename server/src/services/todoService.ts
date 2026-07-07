import { AppError } from '../lib/errors'
import type { CreateTodoBody, Todo, UpdateTodoBody } from '../types/todo'
import { TodoStore } from './todoStore'

export class TodoService {
  constructor(private readonly store: TodoStore) {}

  async list(): Promise<Todo[]> {
    const todos = await this.store.list()
    return [...todos].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1
      return priorityRank(b.priority) - priorityRank(a.priority)
    })
  }

  async create(body: CreateTodoBody): Promise<Todo> {
    const text = body.text?.trim()
    if (!text) {
      throw new AppError('Todo text is required', 400, 'invalid_todo')
    }

    const todo: Todo = {
      id: `td-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text,
      priority: body.priority ?? 'medium',
      done: false,
      createdAt: new Date().toISOString(),
    }

    const todos = await this.store.list()
    todos.unshift(todo)
    await this.store.replace(todos)
    return todo
  }

  async update(id: string, patch: UpdateTodoBody): Promise<Todo> {
    const todos = await this.store.list()
    const idx = todos.findIndex((t) => t.id === id)
    if (idx < 0) {
      throw new AppError('Todo not found', 404, 'todo_not_found')
    }

    const current = todos[idx]!
    const updated: Todo = {
      ...current,
      ...(patch.text !== undefined ? { text: patch.text.trim() || current.text } : {}),
      ...(patch.done !== undefined ? { done: patch.done } : {}),
      ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
    }

    todos[idx] = updated
    await this.store.replace(todos)
    return updated
  }

  async remove(id: string): Promise<void> {
    const todos = await this.store.list()
    const next = todos.filter((t) => t.id !== id)
    if (next.length === todos.length) {
      throw new AppError('Todo not found', 404, 'todo_not_found')
    }
    await this.store.replace(next)
  }
}

function priorityRank(p: Todo['priority']): number {
  if (p === 'high') return 3
  if (p === 'medium') return 2
  return 1
}
