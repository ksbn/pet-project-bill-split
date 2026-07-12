import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../db/pool.js', () => ({
  pool: {
    query: vi.fn(),
  },
}))

import { pool } from '../db/pool.js'
import { getDonations, addDonation } from '../services/donations.js'

describe('donations service (with mocked DB)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('getDonations returns all organizations', async () => {
    const mockDonations = [
      { id: 1, org_name: 'Open Cultural Centre', org_url: 'https://openculturalcentre.org', description: 'Test' },
      { id: 2, org_name: 'Iguality', org_url: 'https://iguality.org', description: 'Test' },
    ]
    pool.query.mockResolvedValueOnce({ rows: mockDonations })

    const donations = await getDonations()
    expect(donations).toHaveLength(2)
    expect(donations[0].org_name).toBe('Open Cultural Centre')
  })

  it('getDonations returns empty array when no organizations', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })
    const donations = await getDonations()
    expect(donations).toHaveLength(0)
  })

  it('addDonation creates and returns new donation', async () => {
    const mockDonation = {
      id: 1,
      org_name: 'Test Org',
      org_url: 'https://test.org',
      description: 'Test description',
      created_at: new Date(),
    }
    pool.query.mockResolvedValueOnce({ rows: [mockDonation] })

    const donation = await addDonation('Test Org', 'https://test.org', 'Test description')
    expect(donation.org_name).toBe('Test Org')
    expect(donation.org_url).toBe('https://test.org')
  })
})