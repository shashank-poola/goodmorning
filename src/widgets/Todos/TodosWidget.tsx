import { useState } from 'react'
import { Panel, WidgetBody } from '../../components/Panel'
import { useWidgetData } from '../../components/useWidgetData'
import { provider } from '../../data/providerFactory'
import type { Todo } from '../../data/types'
import styles from './TodosWidget.module.css'

// v1 has no persistence — check-off state lives only in this component's
// local state, seeded once from the fetched data. A future backend phase
// will wire toggles back through the provider/API.
function TodoList({ initial }: { initial: Todo[] }) {
  const [todos, setTodos] = useState(initial)
  const toggle = (id: string) =>
    setTodos((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))

  return (
    <ul className={styles.list}>
      {todos.map((t) => (
        <li key={t.id} className={styles.item} data-priority={t.priority}>
          <label className={t.done ? styles.done : styles.label}>
            <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
            <span>{t.text}</span>
          </label>
        </li>
      ))}
    </ul>
  )
}

export function TodosWidget() {
  const state = useWidgetData(provider.getTodos)
  return (
    <Panel title="To-Do" accent="green" id="todos">
      <WidgetBody {...state} isEmpty={(d) => d.length === 0}>
        {(todos) => <TodoList initial={todos} />}
      </WidgetBody>
    </Panel>
  )
}
