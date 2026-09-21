import { useEffect, useMemo, useState } from 'react'
import api, { auth } from './api'
import AuthPage from './components/AuthPage'
import TaskForm from './components/TaskForm'
import TaskItem from './components/TaskItem'

const FILTERS = [
  ['all', 'All'],
  ['todo', 'To do'],
  ['in-progress', 'In progress'],
  ['done', 'Done'],
]

export default function App() {
  const [user, setUser] = useState(() => (auth.isAuthenticated() ? {} : null))
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    if (!user) return
    api
      .list()
      .then(setTasks)
      .catch(() => setError("Couldn't load tasks. Check that the backend is running."))
      .finally(() => setLoading(false))
  }, [user])

  const counts = useMemo(() => {
    const c = { all: tasks.length, todo: 0, 'in-progress': 0, done: 0 }
    tasks.forEach((t) => c[t.status]++)
    return c
  }, [tasks])

  const logout = () => {
    auth.logout()
    setUser(null)
    setTasks([])
  }

  if (!user) return <AuthPage onAuthenticated={setUser} />

  // Runs an API call, shows an error banner on failure, returns true on success.
  const run = async (fn) => {
    setError('')
    try {
      await fn()
      return true
    } catch (e) {
      setError(e.response?.data?.message || 'That request failed. Try again.')
      return false
    }
  }

  const replace = (updated) => setTasks((ts) => ts.map((t) => (t._id === updated._id ? updated : t)))

  const save = (data) =>
    run(async () => {
      if (editing) {
        replace(await api.update(editing._id, data))
        setEditing(null)
      } else {
        const created = await api.create(data)
        setTasks((ts) => [created, ...ts])
      }
    })

  const setStatus = (task, status) => run(async () => replace(await api.update(task._id, { status })))

  const remove = (task) =>
    run(async () => {
      await api.remove(task._id)
      setTasks((ts) => ts.filter((t) => t._id !== task._id))
      if (editing?._id === task._id) setEditing(null)
    })

  const visible = tasks.filter((t) => {
    const q = query.trim().toLowerCase()
    const matches = !q || `${t.title} ${t.description || ''}`.toLowerCase().includes(q)
    return matches && (filter === 'all' || t.status === filter)
  })

  return (
    <main className="app">
      <header className="top-bar">
        <div>
          <h1>Student Task Manager</h1>
          <p className="muted">
            {counts.done} of {counts.all} tasks done
          </p>
        </div>
        <button onClick={logout}>Log out</button>
      </header>

      <TaskForm editing={editing} onSave={save} onCancel={() => setEditing(null)} />

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="toolbar">
        <div className="tabs" role="tablist">
          {FILTERS.map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={filter === key}
              className={filter === key ? 'tab active' : 'tab'}
              onClick={() => setFilter(key)}
            >
              {label} ({counts[key]})
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Search tasks"
          aria-label="Search tasks"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="muted">Loading tasks…</p>
      ) : visible.length === 0 ? (
        <p className="empty">
          {tasks.length === 0 ? 'No tasks yet. Add your first one above.' : 'No tasks match this filter.'}
        </p>
      ) : (
        <ul className="list">
          {visible.map((task) => (
            <TaskItem key={task._id} task={task} onStatus={setStatus} onEdit={setEditing} onDelete={remove} />
          ))}
        </ul>
      )}
    </main>
  )
}
