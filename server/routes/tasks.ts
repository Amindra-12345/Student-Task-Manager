import { Router } from 'express'
import { isValidObjectId } from 'mongoose'
import Task from '../models/Task'

const router = Router()
const FIELDS = ['title', 'description', 'dueDate', 'priority', 'status']

// Only allow known fields through, so clients can't set _id, createdAt, etc.
const pick = (body: Record<string, unknown> = {}) =>
  Object.fromEntries(FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]))

router.get('/', async (_req, res) => {
  res.json(await Task.find().sort({ createdAt: -1 }))
})

router.post('/', async (req, res) => {
  const task = await Task.create(pick(req.body))
  res.status(201).json(task)
})

router.put('/:id', async (req, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid task id' })
  const task = await Task.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true })
  if (!task) return res.status(404).json({ message: 'Task not found' })
  res.json(task)
})

router.delete('/:id', async (req, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid task id' })
  const task = await Task.findByIdAndDelete(req.params.id)
  if (!task) return res.status(404).json({ message: 'Task not found' })
  res.status(204).end()
})

export default router
