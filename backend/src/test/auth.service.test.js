import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../db/pool.js', () => ({
  pool: {
    query: vi.fn(),
  },
}))

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn(),
  }
}))

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mock_token'),
    verify: vi.fn(),
  }
}))

import { pool } from '../db/pool.js'
import { register, login, verifyToken } from '../services/auth.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

describe('auth service (with mocked DB)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('register creates account and returns token', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] }) // no existing account
      .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Alice', email: 'alice@test.com' }] }) // INSERT

    const result = await register('Alice', 'alice@test.com', 'password123')

    expect(result.account.email).toBe('alice@test.com')
    expect(result.token).toBe('mock_token')
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10)
  })

  it('register throws if email already exists', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }) // existing account

    await expect(register('Alice', 'alice@test.com', 'password123'))
      .rejects.toThrow('Email already registered')
  })

  it('login returns token for valid credentials', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, name: 'Alice', email: 'alice@test.com', password_hash: 'hashed_password' }]
    })
    bcrypt.compare.mockResolvedValueOnce(true)

    const result = await login('alice@test.com', 'password123')

    expect(result.account.email).toBe('alice@test.com')
    expect(result.token).toBe('mock_token')
  })

  it('login throws for wrong password', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, name: 'Alice', email: 'alice@test.com', password_hash: 'hashed_password' }]
    })
    bcrypt.compare.mockResolvedValueOnce(false)

    await expect(login('alice@test.com', 'wrongpassword'))
      .rejects.toThrow('Invalid email or password')
  })

  it('login throws for unknown email', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })

    await expect(login('nobody@test.com', 'password123'))
      .rejects.toThrow('Invalid email or password')
  })

  it('verifyToken returns payload for valid token', () => {
    jwt.verify.mockReturnValueOnce({ id: 1, email: 'alice@test.com' })

    const payload = verifyToken('mock_token')
    expect(payload.email).toBe('alice@test.com')
  })
})