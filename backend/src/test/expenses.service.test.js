import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../db/pool.js', () => ({
  pool: {
    connect: vi.fn(),
    query: vi.fn(),
  },
}))

import { pool } from '../db/pool.js'
import { addExpense, getExpensesByGroup, recalculateSplits } from '../services/expenses.js'

function mockClient(responses) {
  let call = 0
  const client = {
    query: vi.fn(() => Promise.resolve(responses[call++] ?? { rows: [] })),
    release: vi.fn(),
  }
  pool.connect.mockResolvedValue(client)
  return client
}

describe('expenses service (with mocked DB)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('adds expense with even split when no splits provided', async () => {
    const mockExpense = { id: 1, group_id: 1, paid_by: 1, title: 'Dinner', amount: '90.00' }
    mockClient([
      { rows: [] },                          // BEGIN
      { rows: [mockExpense] },               // INSERT expense
      { rows: [{ id: 1 }, { id: 2 }] },     // SELECT users
      { rows: [] },                          // INSERT split user 1
      { rows: [] },                          // INSERT split user 2
      { rows: [] },                          // COMMIT
    ])

    const expense = await addExpense(1, 1, 'Dinner', 90)
    expect(expense.title).toBe('Dinner')
    expect(expense.amount).toBe('90.00')
  })

  it('adds expense with custom splits when splits provided', async () => {
    const mockExpense = { id: 2, group_id: 1, paid_by: 1, title: 'Pizza', amount: '90.00' }
    mockClient([
      { rows: [] },            // BEGIN
      { rows: [mockExpense] }, // INSERT expense
      { rows: [] },            // INSERT custom split 1
      { rows: [] },            // INSERT custom split 2
      { rows: [] },            // COMMIT
    ])

    const splits = [{ user_id: 1, amount: 50 }, { user_id: 2, amount: 40 }]
    const expense = await addExpense(1, 1, 'Pizza', 90, splits)
    expect(expense.title).toBe('Pizza')
  })

  it('throws error when custom splits do not add up to total', async () => {
    const mockExpense = { id: 3, group_id: 1, paid_by: 1, title: 'Pizza', amount: '90.00' }
    mockClient([
      { rows: [] },            // BEGIN
      { rows: [mockExpense] }, // INSERT expense
      { rows: [] },            // ROLLBACK
    ])

    const splits = [{ user_id: 1, amount: 50 }, { user_id: 2, amount: 30 }]
    await expect(addExpense(1, 1, 'Pizza', 90, splits)).rejects.toThrow('Splits must add up')
  })

  it('recalculates splits for all expenses in group', async () => {
    mockClient([
      { rows: [] },                            // BEGIN
      { rows: [{ id: 1, amount: '90.00' }] }, // SELECT expenses
      { rows: [{ id: 1 }, { id: 2 }] },       // SELECT users
      { rows: [] },                            // DELETE splits expense 1
      { rows: [] },                            // INSERT split user 1
      { rows: [] },                            // INSERT split user 2
      { rows: [] },                            // COMMIT
    ])

    const result = await recalculateSplits(1)
    expect(result.recalculated).toBe(1)
  })
})