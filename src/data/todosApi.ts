import type { Todo } from '../data/types'

const apiBase = import.meta.env.VITE_API_BASE_URL ?? ''

function url(path: string): string {
  return `${apiBase}${path}`.replace(/([^:]\/)\/+/g, '$1')
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string }
    return body.message ?? `Request failed (${res.status})`
  } catch {
    return `Request failed (${res.status})`
  }
}

export async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(url('/api/todos'))
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<Todo[]>
}

export async function createTodo(text: string): Promise<Todo> {
  const res = await fetch(url('/api/todos'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<Todo>
}

export async function updateTodo(id: string, patch: { done?: boolean; text?: string }): Promise<Todo> {
  const res = await fetch(url(`/api/todos/${id}`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<Todo>
}

export async function deleteTodo(id: string): Promise<void> {
  const res = await fetch(url(`/api/todos/${id}`), { method: 'DELETE' })
  if (!res.ok) throw new Error(await parseError(res))
}

/** True when API mode is on — todos persist via backend. */
export function todosUseApi(): boolean {
  return import.meta.env.VITE_USE_API === 'true' && import.meta.env.MODE !== 'test'
}
