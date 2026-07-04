import { Router } from 'express'
import { register, login } from '../services/auth.js'

export const authRoutes = Router()

authRoutes.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }
    const { account, token } = await register(name, email, password)
    res.status(201).json({ account, token })
  } catch (err) {
    if (err.message === 'Email already registered') {
      return res.status(409).json({ error: err.message })
    }
    console.error(err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

authRoutes.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' })
    }
    const { account, token } = await login(email, password)
    res.json({ account, token })
  } catch (err) {
    if (err.message === 'Invalid email or password') {
      return res.status(401).json({ error: err.message })
    }
    console.error(err)
    res.status(500).json({ error: 'Login failed' })
  }
})