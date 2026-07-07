import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { pool } from '../db/pool.js'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'
const SALT_ROUNDS = 10

export async function register(name, email, password) {
  // Check if email already exists
  const { rows: existing } = await pool.query(
    'SELECT id FROM accounts WHERE email = $1',
    [email]
  )
  if (existing.length > 0) {
    throw new Error('Email already registered')
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS)

  // Create account
  const { rows } = await pool.query(
    'INSERT INTO accounts (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
    [name, email, password_hash]
  )

  const account = rows[0]
  const token = jwt.sign({ id: account.id, email: account.email }, JWT_SECRET, { expiresIn: '7d' })

  return { account, token }
}

export async function login(email, password) {
  // Find account
  const { rows } = await pool.query(
    'SELECT * FROM accounts WHERE email = $1',
    [email]
  )
  if (rows.length === 0) {
    throw new Error('Invalid email or password')
  }

  const account = rows[0]

  // Check password
  const valid = await bcrypt.compare(password, account.password_hash)
  if (!valid) {
    throw new Error('Invalid email or password')
  }

  const token = jwt.sign({ id: account.id, email: account.email }, JWT_SECRET, { expiresIn: '7d' })

  return {
    account: { id: account.id, name: account.name, email: account.email },
    token,
  }
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}