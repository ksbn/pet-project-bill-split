import { Router } from 'express'
import { getDonations, addDonation } from '../services/donations.js'

export const donationRoutes = Router()

donationRoutes.get('/', async (_req, res) => {
  try {
    const donations = await getDonations()
    res.json(donations)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch donations' })
  }
})

donationRoutes.post('/', async (req, res) => {
  try {
    const { org_name, org_url, description } = req.body
    if (!org_name || !org_url) {
      return res.status(400).json({ error: 'org_name and org_url are required' })
    }
    const donation = await addDonation(org_name, org_url, description)
    res.status(201).json(donation)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add donation' })
  }
})