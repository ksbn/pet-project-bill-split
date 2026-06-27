import { Router } from 'express'
import { getSettlements } from '../services/settlements.js'

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

export default router