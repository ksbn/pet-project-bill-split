import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import GroupViewPage from '../pages/GroupViewPage'

function renderPage(inviteCode = 'ABC123') {
  return render(
    <MemoryRouter initialEntries={[`/view/${inviteCode}`]}>
      <Routes>
        <Route path="/view/:inviteCode" element={<GroupViewPage />} />
      </Routes>
    </MemoryRouter>
  )
}

const baseGroup = { id: 1, name: 'Trip to Spain', invite_code: 'ABC123' }
const baseUsers = [
  { id: 1, name: 'Alice', email: 'alice@test.com' },
  { id: 2, name: 'Bob', email: '' },
]

function mockFetchSequence({ group = baseGroup, groupOk = true, users = [], expenses = [], settlements = [] } = {}) {
  global.fetch = vi.fn()
    .mockResolvedValueOnce({ ok: groupOk, json: () => Promise.resolve(group) })
    .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(users) })
    .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(expenses) })
    .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(settlements) })
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('GroupViewPage', () => {
  it('shows a loading state initially', () => {
    global.fetch = vi.fn(() => new Promise(() => {})) // never resolves
    renderPage()
    expect(screen.getByText('Loading group…')).toBeInTheDocument()
  })

  it('shows group name and invite code once loaded', async () => {
    mockFetchSequence()
    renderPage()
    expect(await screen.findByText('Trip to Spain')).toBeInTheDocument()
    expect(screen.getByText('ABC123')).toBeInTheDocument()
  })

  it('shows an error message when the invite code is invalid', async () => {
    mockFetchSequence({ groupOk: false })
    renderPage()
    expect(await screen.findByText('Group not found')).toBeInTheDocument()
  })

  it('shows an error message when a network request throws', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network down'))
    renderPage()
    expect(await screen.findByText('network down')).toBeInTheDocument()
  })

  it('shows an empty state when there are no members', async () => {
    mockFetchSequence({ users: [] })
    renderPage()
    await screen.findByText('Trip to Spain')
    expect(screen.getByText('No members yet.')).toBeInTheDocument()
  })

  it('lists members once loaded', async () => {
    mockFetchSequence({ users: baseUsers })
    renderPage()
    expect(await screen.findByText('Alice', { selector: 'strong' })).toBeInTheDocument()
    expect(screen.getByText('Bob', { selector: 'strong' })).toBeInTheDocument()
    expect(screen.getByText('alice@test.com')).toBeInTheDocument()
  })

  it('shows an empty state when there are no expenses', async () => {
    mockFetchSequence({ users: baseUsers, expenses: [] })
    renderPage()
    await screen.findByText('Trip to Spain')
    expect(screen.getByText('No expenses yet.')).toBeInTheDocument()
  })

  it('lists expenses with payer name and per-person share', async () => {
    mockFetchSequence({
      users: baseUsers,
      expenses: [{ id: 10, title: 'Dinner', amount: 100, paid_by: 1 }],
    })
    renderPage()

    expect(await screen.findByText('Dinner')).toBeInTheDocument()
    expect(screen.getByText(/paid by Alice/)).toBeInTheDocument()
    // 100 / 2 members = 50.00 per person
    expect(screen.getByText('€50.00 per person')).toBeInTheDocument()
  })

  it('shows "unknown" as payer when the paying user cannot be found', async () => {
    mockFetchSequence({
      users: baseUsers,
      expenses: [{ id: 11, title: 'Taxi', amount: 20, paid_by: 999 }],
    })
    renderPage()

    expect(await screen.findByText('Taxi')).toBeInTheDocument()
    expect(screen.getByText(/paid by unknown/)).toBeInTheDocument()
  })

  it('shows "settled up" message when there are no settlements', async () => {
    mockFetchSequence({ users: baseUsers, settlements: [] })
    renderPage()
    expect(await screen.findByText('Everyone is settled up! 🎉')).toBeInTheDocument()
  })

  it('lists settlements with amounts', async () => {
    mockFetchSequence({
      users: baseUsers,
      settlements: [{ from: 'Bob', to: 'Alice', amount: 45 }],
    })
    renderPage()

    expect(await screen.findByText(/owes/)).toBeInTheDocument()
    expect(screen.getByText('€45.00')).toBeInTheDocument()
  })

  it('shows a "Pay via Revolut" link when a settlement has a revolut_link', async () => {
    mockFetchSequence({
      users: baseUsers,
      settlements: [{ from: 'Bob', to: 'Alice', amount: 45, revolut_link: 'https://revolut.me/alice' }],
    })
    renderPage()

    const link = await screen.findByRole('link', { name: /pay via revolut/i })
    expect(link).toHaveAttribute('href', 'https://revolut.me/alice')
  })

  it('does not show a "Pay via Revolut" link when there is none', async () => {
    mockFetchSequence({
      users: baseUsers,
      settlements: [{ from: 'Bob', to: 'Alice', amount: 45 }],
    })
    renderPage()

    await screen.findByText(/owes/)
    expect(screen.queryByRole('link', { name: /pay via revolut/i })).not.toBeInTheDocument()
  })
})
