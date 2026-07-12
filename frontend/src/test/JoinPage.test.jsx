import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import JoinPage from '../pages/JoinPage'
import { getGroupByInviteCode, joinGroupByInviteCode } from '../services/api'
import { getToken } from '../services/token'

vi.mock('../services/api', () => ({
  getGroupByInviteCode: vi.fn(),
  joinGroupByInviteCode: vi.fn(),
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
    <MemoryRouter initialEntries={['/join/ABC123']}>
      <Routes>
        <Route path="/join/:inviteCode" element={<JoinPage />} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  getToken.mockReturnValue('fake-token')
})

describe('JoinPage', () => {
  it('redirects to /login when there is no token', async () => {
    getToken.mockReturnValue(null)
    renderPage()
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  it('shows the group name once the invite is loaded', async () => {
    getGroupByInviteCode.mockResolvedValue({ id: 1, name: 'Trip to Spain' })
    renderPage()
    expect(await screen.findByText('Trip to Spain')).toBeInTheDocument()
  })

  it('shows an error for an invalid invite code', async () => {
    getGroupByInviteCode.mockRejectedValue(new Error('not found'))
    renderPage()
    expect(await screen.findByText('Invalid or expired invite link.')).toBeInTheDocument()
  })

  it('requires a name before joining', async () => {
    getGroupByInviteCode.mockResolvedValue({ id: 1, name: 'Trip to Spain' })
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Trip to Spain')
    await user.click(screen.getByRole('button', { name: /join group/i }))

    expect(joinGroupByInviteCode).not.toHaveBeenCalled()
    expect(await screen.findByText('Please enter your name.')).toBeInTheDocument()
  })

  it('joins the group and navigates to the group page on success', async () => {
    getGroupByInviteCode.mockResolvedValue({ id: 1, name: 'Trip to Spain' })
    joinGroupByInviteCode.mockResolvedValue({ id: 99, group_id: 1 })
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Trip to Spain')
    await user.type(screen.getByPlaceholderText('e.g. Alice'), 'Dave')
    await user.click(screen.getByRole('button', { name: /join group/i }))

    await waitFor(() => {
      expect(joinGroupByInviteCode).toHaveBeenCalledWith('ABC123', { name: 'Dave' })
    })
    expect(mockNavigate).toHaveBeenCalledWith('/groups/1')
  })

  it('shows an error message if joining fails (regression test for undefined `err` bug)', async () => {
    getGroupByInviteCode.mockResolvedValue({ id: 1, name: 'Trip to Spain' })
    joinGroupByInviteCode.mockRejectedValue(new Error('server error'))
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Trip to Spain')
    await user.type(screen.getByPlaceholderText('e.g. Alice'), 'Dave')
    await user.click(screen.getByRole('button', { name: /join group/i }))

    // This currently fails because the catch block references an undefined
    // `err` variable (`catch { console.error(err) }`), which throws before
    // setFormError ever runs. Fixing the catch signature to `catch (err)`
    // makes this pass.
    expect(await screen.findByText('Could not join group. Please try again.')).toBeInTheDocument()
  })
})