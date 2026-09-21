import { useEffect, useState } from 'react'

const BLANK = { title: '', description: '', dueDate: '', priority: 'medium' }

export default function TaskForm({ editing, onSave, onCancel }) {
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(
      editing
        ? {
            title: editing.title,
            description: editing.description || '',
            dueDate: editing.dueDate ? editing.dueDate.slice(0, 10) : '',
            priority: editing.priority,
          }
        : BLANK,
    )
  }, [editing])

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const ok = await onSave({ ...form, title: form.title.trim(), dueDate: form.dueDate || null })
    setSaving(false)
    if (ok && !editing) setForm(BLANK)
  }

  return (
    <form className="form" onSubmit={submit}>
      <h2>{editing ? 'Edit task' : 'New task'}</h2>
      <label className="wide">
        Title
        <input name="title" value={form.title} onChange={change} maxLength={120} required placeholder="e.g. Finish DevOps report" />
      </label>
      <label>
        Due date
        <input type="date" name="dueDate" value={form.dueDate} onChange={change} />
      </label>
      <label>
        Priority
        <select name="priority" value={form.priority} onChange={change}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
      <label className="wide">
        Notes
        <textarea name="description" value={form.description} onChange={change} rows={2} maxLength={500} />
      </label>
      <div className="actions wide">
        <button className="primary" disabled={saving || !form.title.trim()}>
          {editing ? 'Save changes' : 'Add task'}
        </button>
        {editing && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
