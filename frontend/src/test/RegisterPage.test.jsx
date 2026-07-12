import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RegisterPage from '../pages/RegisterPage'
import { register } from '../services/api'
import { setToken } from '../services/token'

vi.mock('../services/api', () => ({
  register: vi.fn(),
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
      <RegisterPage />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('RegisterPage', () => {
  it('stores the token and navigates to / on successful registration', async () => {
    register.mockResolvedValue({
      token: 'fake-token',
      account: { id: 1, name: 'Test User', email: 'test@test.com' },
    })
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByPlaceholderText('Your name'), 'Test User')
    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com')
    await user.type(screen.getByPlaceholderText('min 6 characters'), 'password1')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith('Test User', 'test@test.com', 'password1')
    })
    expect(setToken).toHaveBeenCalledWith('fake-token')
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('shows an error and does not navigate when the API call fails', async () => {
    register.mockRejectedValue(new Error('Email already registered'))
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByPlaceholderText('Your name'), 'Test User')
    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com')
    await user.type(screen.getByPlaceholderText('min 6 characters'), 'password1')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText('Email already registered')).toBeInTheDocument()
    expect(setToken).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows a validation error and does not call the API for an invalid email', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByPlaceholderText('Your name'), 'Test User')
    await user.type(screen.getByPlaceholderText('you@example.com'), 'notanemail')
    await user.type(screen.getByPlaceholderText('min 6 characters'), 'password1')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(register).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows a validation error and does not call the API for a weak password', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByPlaceholderText('Your name'), 'Test User')
    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com')
    await user.type(screen.getByPlaceholderText('min 6 characters'), 'abc')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(register).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})