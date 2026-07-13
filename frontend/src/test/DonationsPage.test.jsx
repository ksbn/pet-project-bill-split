import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DonationsPage from '../pages/DonationsPage'
import { getDonations } from '../services/api'
import { getToken } from '../services/token'

vi.mock('../services/api', () => ({
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

function renderPage() {
  return render(
    <MemoryRouter>
      <DonationsPage />
    </MemoryRouter>
  )
}

const baseOrgs = [
  { id: 1, org_name: 'Red Cross', org_url: 'https://redcross.org', description: 'Emergency relief worldwide' },
  { id: 2, org_name: 'WWF', org_url: 'https://wwf.org', description: null },
]

beforeEach(() => {
  vi.clearAllMocks()
  getToken.mockReturnValue('fake-token')
})

describe('DonationsPage', () => {
  it('redirects to /login when there is no token', async () => {
    getToken.mockReturnValue(null)
    renderPage()
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  it('shows an empty state when there are no organisations', async () => {
    getDonations.mockResolvedValue([])
    renderPage()
    expect(await screen.findByText('No organisations available yet.')).toBeInTheDocument()
  })

  it('shows an error message when organisations fail to load', async () => {
    getDonations.mockRejectedValue(new Error('network error'))
    renderPage()
    expect(await screen.findByText('Could not load organisations.')).toBeInTheDocument()
  })

  it('lists organisations with name and description', async () => {
    getDonations.mockResolvedValue(baseOrgs)
    renderPage()

    expect(await screen.findByText('Red Cross')).toBeInTheDocument()
    expect(screen.getByText('WWF')).toBeInTheDocument()
    expect(screen.getByText('Emergency relief worldwide')).toBeInTheDocument()
  })

  it('does not render a description paragraph when none is provided', async () => {
    getDonations.mockResolvedValue([baseOrgs[1]]) // WWF has description: null
    renderPage()

    await screen.findByText('WWF')
    // only the org name should render, no stray empty description text
    expect(screen.queryByText('null')).not.toBeInTheDocument()
  })

  it('shows a "More Info" link pointing to each organisation\'s website', async () => {
    getDonations.mockResolvedValue(baseOrgs)
    renderPage()

    await screen.findByText('Red Cross')
    const links = screen.getAllByRole('link', { name: /more info/i })
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', 'https://redcross.org')
    expect(links[1]).toHaveAttribute('href', 'https://wwf.org')
  })

  it('opens the "More Info" link in a new tab safely', async () => {
    getDonations.mockResolvedValue(baseOrgs)
    renderPage()

    const links = await screen.findAllByRole('link', { name: /more info/i })
    expect(links[0]).toHaveAttribute('target', '_blank')
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
