import { pool } from '../db/pool.js'
import crypto from 'crypto'

export async function createGroup(name) {
  const invite_code = crypto.randomUUID().slice(0, 8)
  const { rows } = await pool.query(
    'INSERT INTO groups (name, invite_code) VALUES ($1, $2) RETURNING *',
    [name, invite_code]
  )
  return rows[0]
}

export async function getGroupByInviteCode(invite_code) {
  const { rows } = await pool.query(
    'SELECT * FROM groups WHERE invite_code = $1',
    [invite_code]
  )
  return rows[0] ?? null
}

export async function getGroupById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM groups WHERE id = $1',
    [id]
  )
  return rows[0] ?? null
}