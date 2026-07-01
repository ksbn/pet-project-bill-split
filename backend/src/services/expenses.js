import { pool } from '../db/pool.js'

export async function addExpense(group_id, paid_by, title, amount, splits = null) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // the expense
    const { rows } = await client.query(
      'INSERT INTO expenses (group_id, paid_by, title, amount) VALUES ($1, $2, $3, $4) RETURNING *',
      [group_id, paid_by, title, amount]
    )
    const expense = rows[0]

    if (splits && splits.length > 0) {
      // Custom splits — validate they add up to total
      const total = splits.reduce((sum, s) => sum + Number(s.amount), 0)
      if (Math.abs(total - Number(amount)) > 0.01) {
        throw new Error(`Splits must add up to total amount. Got ${total}, expected ${amount}`)
      }

      // custom splits
      for (const split of splits) {
        await client.query(
          'INSERT INTO expense_splits (expense_id, user_id, amount) VALUES ($1, $2, $3)',
          [expense.id, split.user_id, split.amount]
        )
      }
    } else {

    // users in the group for even split
    const { rows: users } = await client.query(
      'SELECT id FROM users WHERE group_id = $1',
      [group_id]
    )

    if (users.length === 0) throw new Error('No users in group')

    const share = (Number(amount) / users.length).toFixed(2)

    // split for each user
    for (const user of users) {
      await client.query(
        'INSERT INTO expense_splits (expense_id, user_id, amount) VALUES ($1, $2, $3)',
        [expense.id, user.id, share]
      )
    }
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

export async function recalculateSplits(group_id) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // get all expenses in the group
    const { rows: expenses } = await client.query(
      'SELECT * FROM expenses WHERE group_id = $1',
      [group_id]
    )

    // get current members
    const { rows: users } = await client.query(
      'SELECT id FROM users WHERE group_id = $1',
      [group_id]
    )

    if (users.length === 0) throw new Error('No users in group')

    for (const expense of expenses) {
      // delete existing splits
      await client.query(
        'DELETE FROM expense_splits WHERE expense_id = $1',
        [expense.id]
      )

      // recalculate even split
      const share = (Number(expense.amount) / users.length).toFixed(2)

      for (const user of users) {
        await client.query(
          'INSERT INTO expense_splits (expense_id, user_id, amount) VALUES ($1, $2, $3)',
          [expense.id, user.id, share]
        )
      }
    }

    await client.query('COMMIT')
    return { recalculated: expenses.length }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}