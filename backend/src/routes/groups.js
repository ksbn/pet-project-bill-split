import { Router } from 'express'
import { createGroup, getGroupByInviteCode, getGroupById } from '../services/groups.js'
import { pool } from '../db/pool.js'

export const groupRoutes = Router()

groupRoutes.post('/', async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'name is required' })
    if (name.trim().length < 3) return res.status(400).json({ error: 'Group name must be at least 3 characters' })
    if (name.trim().length > 100) return res.status(400).json({ error: 'Group name must be less than 100 characters' })
    const group = await createGroup(name, req.account.id)
    res.status(201).json(group)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create group' })
  }
})

groupRoutes.get('/id/:id', async (req, res) => {
  try {
    const group = await getGroupById(req.params.id)
    if (!group) return res.status(404).json({ error: 'Group not found' })
    res.json(group)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch group' })
  }
})

groupRoutes.get('/:inviteCode', async (req, res) => {
  try {
    const group = await getGroupByInviteCode(req.params.inviteCode)
    if (!group) return res.status(404).json({ error: 'Group not found' })
    res.json(group)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch group' })
  }
})

groupRoutes.get('/my', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM groups WHERE account_id = $1 ORDER BY created_at DESC',
      [req.account.id]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch groups' })
  }
})