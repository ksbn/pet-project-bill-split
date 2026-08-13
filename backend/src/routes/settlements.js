import { Router } from 'express'
import { getSettlements, confirmSettlement, getConfirmedSettlements } from '../services/settlements.js'
import { broadcast } from '../sse/store.js'

const router = Router({ mergeParams: true })

router.get('/', async (req, res) => {
  try {
    const settlements = await getSettlements(Number(req.params.id))
    res.json(settlements)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to calculate settlements' })
  }
})

router.post('/confirm', async (req, res) => {
  try {
    const { from_name, to_name, amount } = req.body
    if (!from_name || !to_name || !amount) {
      return res.status(400).json({ error: 'from_name, to_name and amount are required' })
    }
    const confirmation = await confirmSettlement(
      Number(req.params.id),
      from_name,
      to_name,
      amount
    )
    res.status(201).json(confirmation)
    broadcast(Number(req.params.id), 'settlement_confirmed', confirmation)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to confirm settlement' })
  }
})

router.get('/confirmed', async (req, res) => {
  try {
    const confirmed = await getConfirmedSettlements(Number(req.params.id))
    res.json(confirmed)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch confirmed settlements' })
  }
})

export default router