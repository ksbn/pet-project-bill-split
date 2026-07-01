import { pool } from "../db/pool.js";

/* add a user to a group */
async function addUserToGroup({ group_id, name, email, revolut_link }) {
  const result = await pool.query(
    `INSERT INTO users (group_id, name, email, revolut_link)
        VALUES ($1, $2, $3, $4)
        RETURNING id, group_id, name, email, revolut_link`,
    [group_id, name, email, revolut_link ?? null]
  )
  return result.rows[0]
};

/* fetch users by group */
async function getUsersByGroup(group_id) {
  const result = await pool.query(
    `SELECT id, group_id, name, email, revolut_link
        FROM users
        WHERE group_id = $1
        ORDER BY id ASC`,
    [group_id]
  )
  return result.rows;
};

export { addUserToGroup, getUsersByGroup }
