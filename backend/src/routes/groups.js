import { Router } from 'express'
import { createGroup, getGroupByInviteCode, getGroupById } from '../services/groups.js'

export const groupRoutes = Router()

groupRoutes.post('/', async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'name is required' })
    const group = await createGroup(name)
    res.status(201).json(group)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create group' })
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

groupRoutes.get('/id/:id', async (req, res) => {
  try {
    const group = await getGroupById(Number(req.params.id))
    if (!group) return res.status(404).json({ error: 'Group not found' })
    res.json(group)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch group' })
  }
})