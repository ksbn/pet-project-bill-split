import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../db/pool.js', () => ({
  pool: {
    query: vi.fn(),
  },
}))

import { pool } from '../db/pool.js'
import { getSettlements } from '../services/settlements.js'

describe('settlements service (with mocked DB)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns empty array when no expenses', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })

    const settlements = await getSettlements(1)
    expect(settlements).toHaveLength(0)
  })

  it('calculates correct settlement when one person paid for all', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }] })
      .mockResolvedValueOnce({ rows: [{ id: 1, paid_by: 1, amount: '90.00' }] })
      .mockResolvedValueOnce({ rows: [
        { user_id: 1, amount: '45.00' },
        { user_id: 2, amount: '45.00' },
      ]})

    const settlements = await getSettlements(1)
    expect(settlements).toHaveLength(1)
    expect(settlements[0].from).toBe('Bob')
    expect(settlements[0].to).toBe('Alice')
    expect(settlements[0].amount).toBe('45.00')
  })

  it('returns empty array when balances are even', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }] })
      .mockResolvedValueOnce({ rows: [
        { id: 1, paid_by: 1, amount: '50.00' },
        { id: 2, paid_by: 2, amount: '50.00' },
      ]})
      .mockResolvedValueOnce({ rows: [
        { user_id: 1, amount: '25.00' },
        { user_id: 2, amount: '25.00' },
        { user_id: 1, amount: '25.00' },
        { user_id: 2, amount: '25.00' },
      ]})

    const settlements = await getSettlements(1)
    expect(settlements).toHaveLength(0)
  })
})