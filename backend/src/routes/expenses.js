import { Router } from 'express'
import { addExpense, getExpensesByGroup, recalculateSplits } from '../services/expenses.js'

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
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add expense' })
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

router.get('/', async (req, res) => {
  try {
    const expenses = await getExpensesByGroup(Number(req.params.id))
    res.json(expenses)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch expenses' })
  }
})

router.post('/recalculate', async (req, res) => {
  try {
    const result = await recalculateSplits(Number(req.params.id))
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to recalculate splits' })
  }
})

export default router