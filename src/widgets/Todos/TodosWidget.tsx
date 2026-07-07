import { useState } from 'react'
import { Panel, WidgetBody } from '../../components/Panel'
import { useWidgetData } from '../../components/useWidgetData'
import { provider } from '../../data/providerFactory'
import { createTodo, deleteTodo, todosUseApi, updateTodo } from '../../data/todosApi'
import type { Todo } from '../../data/types'
import styles from './TodosWidget.module.css'

function TodoList({
  todos,
  onChange,
}: {
  todos: Todo[]
  onChange: (todos: Todo[]) => void
}) {
  const toggle = async (id: string) => {
    const target = todos.find((t) => t.id === id)
    if (!target) return
    const nextDone = !target.done
    const prev = todos
    onChange(todos.map((t) => (t.id === id ? { ...t, done: nextDone } : t)))

    if (!todosUseApi()) return
    try {
      await updateTodo(id, { done: nextDone })
    } catch {
      onChange(prev)
    }
  }

  const remove = async (id: string) => {
    const prev = todos
    onChange(todos.filter((t) => t.id !== id))

    if (!todosUseApi()) return
    try {
      await deleteTodo(id)
    } catch {
      onChange(prev)
    }
  }

  const open = todos.filter((t) => !t.done)
  const done = todos.filter((t) => t.done)

  return (
    <ul className={styles.list}>
      {open.map((t) => (
        <li key={t.id} className={styles.item} data-priority={t.priority}>
          <label className={styles.label}>
            <input
              type="checkbox"
              checked={false}
              onChange={() => void toggle(t.id)}
              aria-label={t.text}
            />
            <span className={styles.text}>{t.text}</span>
          </label>
          <button
            type="button"
            className={styles.remove}
            aria-label={`Remove ${t.text}`}
            title="Remove task"
            onClick={() => void remove(t.id)}
          >
            ×
          </button>
        </li>
      ))}
      {done.map((t) => (
        <li key={t.id} className={styles.item} data-priority={t.priority}>
          <label className={styles.done}>
            <input
              type="checkbox"
              checked
              onChange={() => void toggle(t.id)}
              aria-label={t.text}
            />
            <span className={styles.text}>{t.text}</span>
          </label>
          <button
            type="button"
            className={styles.remove}
            aria-label={`Remove ${t.text}`}
            title="Remove task"
            onClick={() => void remove(t.id)}
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  )
}

export function TodosWidget() {
  const state = useWidgetData(provider.getTodos)
  const [draft, setDraft] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  /**
   * null = no local changes yet → use server data directly (avoids a one-render
   * delay where isEmpty would briefly see [] and show "Nothing here").
   * After any optimistic update this becomes a Todo[] we own.
   */
  const [localTodos, setLocalTodos] = useState<Todo[] | null>(null)

  const addTodo = async () => {
    const text = draft.trim()
    if (!text) return
    setAddError(null)

    if (todosUseApi()) {
      try {
        const created = await createTodo(text)
        setLocalTodos((prev) => [created, ...(prev ?? state.data ?? [])])
        setDraft('')
      } catch (err: unknown) {
        // Surface 409 duplicate errors from backend intelligence (spec §4.3)
        const msg = err instanceof Error ? err.message : 'Could not add task'
        setAddError(msg)
      }
      return
    }

    setLocalTodos((prev) => [
      { id: `local-${Date.now()}`, text, priority: 'medium', done: false },
      ...(prev ?? state.data ?? []),
    ])
    setDraft('')
  }

  return (
    <Panel title="To-Do" accent="sage" id="todos">
      <form
        className={styles.addForm}
        onSubmit={(e) => {
          e.preventDefault()
          void addTodo()
        }}
      >
        <input
          className={styles.addInput}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            if (addError) setAddError(null)
          }}
          placeholder="Add a task for today…"
          aria-label="New todo"
        />
        <button type="submit" className={styles.addBtn} disabled={!draft.trim()}>
          Add
        </button>
      </form>
      {addError && <p className={styles.addError}>{addError}</p>}

      <WidgetBody {...state} isEmpty={(data) => data.length === 0}>
        {(data) => (
          <TodoList
            todos={localTodos ?? data}
            onChange={setLocalTodos}
          />
        )}
      </WidgetBody>
    </Panel>
  )
}
