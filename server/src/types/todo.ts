/** Mirrors src/data/types.ts */
export interface Todo {
  id: string
  text: string
  priority: 'high' | 'medium' | 'low'
  done: boolean
  createdAt: string
}

export interface TodoStoreData {
  todos: Todo[]
}

export interface CreateTodoBody {
  text: string
  priority?: 'high' | 'medium' | 'low'
}

export interface UpdateTodoBody {
  done?: boolean
  text?: string
  priority?: 'high' | 'medium' | 'low'
}
