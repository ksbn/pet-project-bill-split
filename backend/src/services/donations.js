import { pool } from '../db/pool.js'

export async function getDonations() {
  const { rows } = await pool.query(
    'SELECT * FROM donations ORDER BY created_at DESC'
  )
  return rows
}

export async function addDonation(org_name, org_url, description) {
  const { rows } = await pool.query(
    `INSERT INTO donations (org_name, org_url, description)
     VALUES ($1, $2, $3) RETURNING *`,
    [org_name, org_url, description]
  )
  return rows[0]
}