import { pool } from '../db/pool.js'

export async function getSettlements(group_id) {
  const { rows: users } = await pool.query(
    'SELECT id, name FROM users WHERE group_id = $1',
    [group_id]
  )

  const { rows: expenses } = await pool.query(
    'SELECT id, paid_by, amount FROM expenses WHERE group_id = $1',
    [group_id]
  )

  const { rows: splits } = await pool.query(
    `SELECT es.user_id, es.amount 
     FROM expense_splits es
     JOIN expenses e ON e.id = es.expense_id
     WHERE e.group_id = $1`,
    [group_id]
  )

  // Calculate balance for each user
  // positive = they are owed money, negative = they owe money
  const balances = {}
  for (const user of users) {
    balances[user.id] = { name: user.name, balance: 0 }
  }

  for (const expense of expenses) {
    if (balances[expense.paid_by]) {
      balances[expense.paid_by].balance += Number(expense.amount)
    }
  }

  for (const split of splits) {
    if (balances[split.user_id]) {
      balances[split.user_id].balance -= Number(split.amount)
    }
  }

  const debtors = []
  const creditors = []

  for (const [id, { name, balance }] of Object.entries(balances)) {
    if (balance < -0.01) debtors.push({ id, name, amount: -balance })
    if (balance > 0.01) creditors.push({ id, name, amount: balance })
  }

  const settlements = []
  let i = 0, j = 0

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]
    const amount = Math.min(debtor.amount, creditor.amount)

    settlements.push({
      from: debtor.name,
      to: creditor.name,
      amount: amount.toFixed(2),
    })

    debtor.amount -= amount
    creditor.amount -= amount

    if (debtor.amount < 0.01) i++
    if (creditor.amount < 0.01) j++
  }

  return settlements
}