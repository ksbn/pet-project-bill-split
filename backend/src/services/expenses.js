import { pool } from '../db/pool.js'

export async function addExpense(group_id, paid_by, title, amount) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // the expense
    const { rows } = await client.query(
      'INSERT INTO expenses (group_id, paid_by, title, amount) VALUES ($1, $2, $3, $4) RETURNING *',
      [group_id, paid_by, title, amount]
    )
    const expense = rows[0]

    // users in the group for even split
    const { rows: users } = await client.query(
      'SELECT id FROM users WHERE group_id = $1',
      [group_id]
    )

    if (users.length === 0) throw new Error('No users in group')

    const share = (amount / users.length).toFixed(2)

    // split for each user
    for (const user of users) {
      await client.query(
        'INSERT INTO expense_splits (expense_id, user_id, amount) VALUES ($1, $2, $3)',
        [expense.id, user.id, share]
      )
    }

    await client.query('COMMIT')
    return expense
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function getExpensesByGroup(group_id) {
  const { rows } = await pool.query(
    'SELECT * FROM expenses WHERE group_id = $1 ORDER BY created_at DESC',
    [group_id]
  )
  return rows
}