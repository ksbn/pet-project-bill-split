import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import GroupPage from '../pages/GroupPage'
import {
  getGroup,
  getGroupUsers,
  addUserToGroup,
  addExpense,
  getExpenses,
  getSettlements,
  recalculateSplits,
  deleteExpense,
  confirmSettlement,
  getConfirmedSettlements,
  getDonations,
} from '../services/api'
import { getToken } from '../services/token'

vi.mock('../services/api', () => ({
  getGroup: vi.fn(),
  getGroupUsers: vi.fn(),
  addUserToGroup: vi.fn(),
  addExpense: vi.fn(),
  getExpenses: vi.fn(),
  getSettlements: vi.fn(),
  recalculateSplits: vi.fn(),
  deleteExpense: vi.fn(),
  confirmSettlement: vi.fn(),
  getConfirmedSettlements: vi.fn(),
  getDonations: vi.fn(),
}))

vi.mock('../services/token', () => ({
  getToken: vi.fn(),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const baseGroup = { id: '1', name: 'Trip to Spain', invite_code: 'ABC123' }
const baseUsers = [
  { id: 1, name: 'Alice', email: 'alice@test.com' },
  { id: 2, name: 'Bob', email: '' },
]

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/groups/1']}>
      <Routes>
        <Route path="/groups/:groupId" element={<GroupPage />} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  getToken.mockReturnValue('fake-token')
  getGroup.mockResolvedValue(baseGroup)
  getGroupUsers.mockResolvedValue(baseUsers)
  getExpenses.mockResolvedValue([])
  getSettlements.mockResolvedValue([])
  getConfirmedSettlements.mockResolvedValue([])
  getDonations.mockResolvedValue([])
})

describe('GroupPage — auth guard', () => {
  it('redirects to /login when there is no token', async () => {
    getToken.mockReturnValue(null)
    renderPage()
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })
})

describe('GroupPage — loading group data', () => {
  it('shows the group name and invite code once loaded', async () => {
    renderPage()
    expect(await screen.findByText('Trip to Spain')).toBeInTheDocument()
    expect(screen.getByText('ABC123')).toBeInTheDocument()
  })

  it('shows an error message when the group fails to load', async () => {
    getGroup.mockRejectedValue(new Error('not found'))
    renderPage()
    expect(await screen.findByText('Could not load group.')).toBeInTheDocument()
  })

  it('lists members once loaded', async () => {
    renderPage()
    expect(await screen.findByText('Alice', { selector: 'strong' })).toBeInTheDocument()
    expect(screen.getByText('Bob', { selector: 'strong' })).toBeInTheDocument()
    expect(screen.getByText('alice@test.com')).toBeInTheDocument()
  })
})

describe('GroupPage — add member', () => {
  it('adds a member and clears the form on success', async () => {
    addUserToGroup.mockResolvedValue({ id: 3, name: 'Carol', email: 'carol@test.com' })
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Trip to Spain')
    await user.type(screen.getByPlaceholderText('e.g. Alice'), 'Carol')
    await user.type(screen.getByPlaceholderText('e.g. alice@example.com'), 'carol@test.com')
    await user.click(screen.getByRole('button', { name: /add member/i }))

    await waitFor(() => {
      expect(addUserToGroup).toHaveBeenCalledWith('1', {
        name: 'Carol',
        email: 'carol@test.com',
        revolut_link: null,
      })
    })
    expect(await screen.findByText('Carol', { selector: 'strong' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. Alice')).toHaveValue('')
  })

  it('shows a validation error and does not call the API for an invalid email', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Trip to Spain')
    await user.type(screen.getByPlaceholderText('e.g. Alice'), 'Carol')
    await user.type(screen.getByPlaceholderText('e.g. alice@example.com'), 'notanemail')
    await user.click(screen.getByRole('button', { name: /add member/i }))

    expect(addUserToGroup).not.toHaveBeenCalled()
  })

  it('shows an error if adding the member fails', async () => {
    addUserToGroup.mockRejectedValue(new Error('failed'))
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Trip to Spain')
    await user.type(screen.getByPlaceholderText('e.g. Alice'), 'Carol')
    await user.click(screen.getByRole('button', { name: /add member/i }))

    expect(await screen.findByText('Could not add user. Please try again.')).toBeInTheDocument()
  })
})

describe('GroupPage — add expense', () => {
  it('adds an expense with an even split and refreshes settlements', async () => {
    addExpense.mockResolvedValue({ id: 10, title: 'Dinner', amount: 90, paid_by: 1 })
    getSettlements.mockResolvedValueOnce([]) // initial load
    getSettlements.mockResolvedValueOnce([{ from: 'Bob', to: 'Alice', amount: 45 }]) // after add
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Trip to Spain')
    await user.type(screen.getByPlaceholderText('e.g. Dinner'), 'Dinner')
    await user.type(screen.getByPlaceholderText('e.g. 90'), '90')
    await user.selectOptions(screen.getAllByRole('combobox')[0], '1')
    await user.click(screen.getByRole('button', { name: /add expense/i }))

    await waitFor(() => {
      expect(addExpense).toHaveBeenCalledWith('1', {
        title: 'Dinner',
        amount: 90,
        paid_by: 1,
        splits: null,
      })
    })
    expect(await screen.findByText('Dinner')).toBeInTheDocument()
  })

  it('requires a title, amount, and payer before submitting', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Trip to Spain')
    await user.click(screen.getByRole('button', { name: /add expense/i }))

    expect(addExpense).not.toHaveBeenCalled()
    expect(await screen.findByText('Title is required')).toBeInTheDocument()
  })

  it('rejects custom splits that do not add up to the total amount', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Trip to Spain')
    await user.type(screen.getByPlaceholderText('e.g. Dinner'), 'Dinner')
    await user.type(screen.getByPlaceholderText('e.g. 90'), '90')
    await user.selectOptions(screen.getAllByRole('combobox')[0], '1')
    await user.click(screen.getByText('Custom'))

    const splitInputs = screen.getAllByPlaceholderText('0')
    await user.type(splitInputs[0], '40')
    await user.type(splitInputs[1], '40')
    await user.click(screen.getByRole('button', { name: /add expense/i }))

    expect(addExpense).not.toHaveBeenCalled()
    expect(await screen.findByText(/current total/i)).toBeInTheDocument()
  })

  it('deletes an expense after confirmation', async () => {
    getExpenses.mockResolvedValue([{ id: 5, title: 'Taxi', amount: 20, paid_by: 1 }])
    deleteExpense.mockResolvedValue({})
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByText('Taxi')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /delete/i }))

    await waitFor(() => {
      expect(deleteExpense).toHaveBeenCalledWith('1', 5)
    })
    await waitFor(() => {
      expect(screen.queryByText('Taxi')).not.toBeInTheDocument()
    })
  })

  it('does not delete an expense if the user cancels the confirmation', async () => {
    getExpenses.mockResolvedValue([{ id: 5, title: 'Taxi', amount: 20, paid_by: 1 }])
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByText('Taxi')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /delete/i }))

    expect(deleteExpense).not.toHaveBeenCalled()
    expect(screen.getByText('Taxi')).toBeInTheDocument()
  })
})

describe('GroupPage — settlements', () => {
  it('shows "settled up" message when there are no settlements', async () => {
    renderPage()
    expect(await screen.findByText('Everyone is settled up! 🎉')).toBeInTheDocument()
  })

  it('lists settlements and confirms one as paid', async () => {
    getSettlements.mockResolvedValue([{ from: 'Bob', to: 'Alice', amount: 45 }])
    confirmSettlement.mockResolvedValue({})
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    renderPage()

    const markPaidButton = await screen.findByRole('button', { name: /mark as paid/i })
    await user.click(markPaidButton)

    await waitFor(() => {
      expect(confirmSettlement).toHaveBeenCalledWith('1', 'Bob', 'Alice', 45)
    })
    expect(await screen.findByText('✅ Paid')).toBeInTheDocument()
  })

  it('recalculates splits when the button is clicked', async () => {
    recalculateSplits.mockResolvedValue({})
    getSettlements.mockResolvedValue([])
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Trip to Spain')
    await user.click(screen.getByRole('button', { name: /recalculate splits/i }))

    await waitFor(() => {
      expect(recalculateSplits).toHaveBeenCalledWith('1')
    })
  })
})
