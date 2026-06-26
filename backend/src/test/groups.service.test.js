import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../db/pool.js", () => ({
  pool: {
    query: vi.fn(),
  },
}));

import { pool } from "../db/pool.js";
import { createGroup, getGroupByInviteCode } from '../services/groups.js'

describe('groups service (with mocked DB)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('createGroup returns a new group with invite code', async () => {
    const mockGroup = { id: 1, name: 'Weekend Trip', invite_code: 'abc12345', created_at: new Date() }
    pool.query.mockResolvedValueOnce({ rows: [mockGroup] })

    const group = await createGroup('Weekend Trip')
    expect(group.name).toBe('Weekend Trip')
    expect(group.invite_code).toBe('abc12345')
  })

  it('getGroupByInviteCode returns the correct group', async () => {
    const mockGroup = { id: 1, name: 'Weekend Trip', invite_code: 'abc12345' }
    pool.query.mockResolvedValueOnce({ rows: [mockGroup] })

    const group = await getGroupByInviteCode('abc12345')
    expect(group?.id).toBe(1)
    expect(group?.invite_code).toBe('abc12345')
  })

  it('getGroupByInviteCode returns null when not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })

    const group = await getGroupByInviteCode('notexist')
    expect(group).toBeNull()
  })
})