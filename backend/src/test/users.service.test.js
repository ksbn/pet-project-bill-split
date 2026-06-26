import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../db/pool.js', () => ({
  pool: {
    query: vi.fn(),
  },
}))

import { pool } from '../db/pool.js'
import { addUserToGroup, getUsersByGroup } from '../services/users.js'

describe('users service (with mocked DB)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('addUserToGroup returns the new user', async () => {
    const mockUser = { id: 1, group_id: 1, name: 'Anastasiia', email: 'test@test.com' }
    pool.query.mockResolvedValueOnce({ rows: [mockUser] })

    const user = await addUserToGroup({ group_id: 1, name: 'Anastasiia', email: 'test@test.com' })
    expect(user.name).toBe('Anastasiia')
    expect(user.group_id).toBe(1)
  })

  it('getUsersByGroup returns all users in group', async () => {
    const mockUsers = [
      { id: 1, group_id: 1, name: 'Anastasiia' },
      { id: 2, group_id: 1, name: 'Bob' },
    ]
    pool.query.mockResolvedValueOnce({ rows: mockUsers })

    const users = await getUsersByGroup(1)
    expect(users).toHaveLength(2)
    expect(users[0].name).toBe('Anastasiia')
  })

  it('getUsersByGroup returns empty array when no users', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })

    const users = await getUsersByGroup(999)
    expect(users).toHaveLength(0)
  })
})