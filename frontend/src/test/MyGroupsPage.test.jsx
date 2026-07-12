import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import MyGroupsPage from '../pages/MyGroupsPage'
import { getToken } from '../services/token'

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

function renderPage() {
  return render(
    <MemoryRouter>
      <MyGroupsPage />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  getToken.mockReturnValue('fake-token')
  global.fetch = vi.fn()
})

describe('MyGroupsPage', () => {
  it('redirects to /login when there is no token', () => {
    getToken.mockReturnValue(null)
    renderPage()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('shows an empty state when there are no groups', async () => {
    global.fetch.mockResolvedValue({ json: () => Promise.resolve([]) })
    renderPage()
    expect(await screen.findByText('No groups yet.')).toBeInTheDocument()
  })

  it('lists groups once loaded', async () => {
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve([
        { id: 1, name: 'Trip to Spain', invite_code: 'ABC123' },
        { id: 2, name: 'Roommates', invite_code: 'XYZ789' },
      ]),
    })
    renderPage()

    expect(await screen.findByText('Trip to Spain')).toBeInTheDocument()
    expect(screen.getByText('Roommates')).toBeInTheDocument()
    expect(screen.getByText('ABC123')).toBeInTheDocument()
  })

  it('navigates to the group page when a group is clicked', async () => {
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve([{ id: 1, name: 'Trip to Spain', invite_code: 'ABC123' }]),
    })
    const user = userEvent.setup()
    renderPage()

    const groupCard = await screen.findByText('Trip to Spain')
    await user.click(groupCard)

    expect(mockNavigate).toHaveBeenCalledWith('/groups/1')
  })

  it('shows an error message when the fetch fails', async () => {
    global.fetch.mockRejectedValue(new Error('network error'))
    renderPage()
    expect(await screen.findByText('Could not load your groups.')).toBeInTheDocument()
  })

  it('shows an error message when the response is not an array', async () => {
    global.fetch.mockResolvedValue({ json: () => Promise.resolve({ error: 'nope' }) })
    renderPage()
    expect(await screen.findByText('Could not load your groups.')).toBeInTheDocument()
  })
})
