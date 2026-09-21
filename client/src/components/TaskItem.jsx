const today = () => new Date().toISOString().slice(0, 10)

export default function TaskItem({ task, onStatus, onEdit, onDelete }) {
  const due = task.dueDate ? new Date(task.dueDate) : null
  const overdue = due && task.status !== 'done' && task.dueDate.slice(0, 10) < today()

  return (
    <li className={`task ${task.priority} ${task.status === 'done' ? 'done' : ''}`}>
      <div className={`stamp ${overdue ? 'overdue' : ''}`} title={overdue ? 'Overdue' : undefined}>
        {due ? (
          <>
            <strong>{due.getUTCDate()}</strong>
            <span>{due.toLocaleString(undefined, { month: 'short', timeZone: 'UTC' })}</span>
          </>
        ) : (
          <span>No date</span>
        )}
      </div>

      <div className="body">
        <h3>{task.title}</h3>
        {task.description && <p className="muted">{task.description}</p>}
        <p className="meta">
          {task.priority} priority{overdue ? ' · overdue' : ''}
        </p>
      </div>

      <div className="controls">
        <select value={task.status} onChange={(e) => onStatus(task, e.target.value)} aria-label={`Status of ${task.title}`}>
          <option value="todo">To do</option>
          <option value="in-progress">In progress</option>
          <option value="done">Done</option>
        </select>
        <button onClick={() => onEdit(task)}>Edit</button>
        <button className="danger" onClick={() => window.confirm(`Delete "${task.title}"?`) && onDelete(task)}>
          Delete
        </button>
      </div>
    </li>
  )
}
