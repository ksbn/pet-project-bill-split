import { Router } from 'express'
import { addExpense, getExpensesByGroup, recalculateSplits, deleteExpense } from '../services/expenses.js'
import { broadcast } from '../sse/store.js'

const router = Router({ mergeParams: true })

router.post('/', async (req, res) => {
  try {
    const { paid_by, title, amount, splits } = req.body
    if (!paid_by || !title || !amount) {
      return res.status(400).json({ error: 'paid_by, title and amount are required' })
    }
    const expense = await addExpense(
      Number(req.params.id),
      Number(paid_by),
      title,
      Number(amount),
      splits ?? null
    )
    res.status(201).json(expense)
    broadcast(Number(req.params.id), 'expense_added', expense)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Failed to add expense' })
  }
})

router.get('/', async (req, res) => {
  try {
    const expenses = await getExpensesByGroup(Number(req.params.id))
    res.json(expenses)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Failed to fetch expenses' })
  }
})

router.post('/recalculate', async (req, res) => {
  try {
    const result = await recalculateSplits(Number(req.params.id))
    res.json(result)
    broadcast(Number(req.params.id), 'splits_recalculated', {})
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to recalculate splits' })
  }
})

router.delete('/:expenseId', async (req, res) => {
  try {
    const result = await deleteExpense(
      Number(req.params.expenseId),
      Number(req.params.id)
    )
    res.json(result)
    broadcast(Number(req.params.id), 'expense_deleted', { id: Number(req.params.expenseId) })
  } catch (err) {
    console.error(err)
    res.status(404).json({ error: err.message || 'Failed to delete expense' })
  }
})

export default router