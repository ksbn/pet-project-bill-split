import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import { login } from '../services/api'
import { setToken } from '../services/token'

vi.mock('../services/api', () => ({
  login: vi.fn(),
}))

vi.mock('../services/token', () => ({
  setToken: vi.fn(),
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
      <LoginPage />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LoginPage', () => {
  it('stores the token and navigates to / on successful login', async () => {
    login.mockResolvedValue({ token: 'fake-token', account: { id: 1 } })
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'password1')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('test@test.com', 'password1')
    })
    expect(setToken).toHaveBeenCalledWith('fake-token')
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('shows an error and does not navigate on failed login', async () => {
    login.mockRejectedValue(new Error('Invalid email or password'))
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument()
    expect(setToken).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('disables the submit button while loading', async () => {
    let resolveLogin
    login.mockReturnValue(new Promise((resolve) => { resolveLogin = resolve }))
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'password1')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()

    resolveLogin({ token: 'fake-token', account: { id: 1 } })
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled())
  })
})