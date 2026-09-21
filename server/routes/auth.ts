import { Router } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

const sign = (userId: string) => jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

// Strips the password hash before sending a user back to the client.
const toPublicUser = (user: any) => ({ id: user._id, name: user.name, email: user.email })

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body ?? {}
  const user = await User.create({ name, email, password })
  res.status(201).json({ token: sign(user.id), user: toPublicUser(user) })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {}
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })

  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password')
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }
  res.json({ token: sign(user.id), user: toPublicUser(user) })
})

export default router
