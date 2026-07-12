import { describe, it, expect } from 'vitest'
import {
  validateGroupName,
  validateMemberName,
  validateEmail,
  validatePassword,
  validateAmount,
} from '../utils/validate'

describe('validateGroupName', () => {
  it('returns error for empty name', () => {
    expect(validateGroupName('')).toBeTruthy()
  })
  it('returns error for name shorter than 3 chars', () => {
    expect(validateGroupName('ab')).toBeTruthy()
  })
  it('returns error for special characters', () => {
    expect(validateGroupName('Group@!')).toBeTruthy()
  })
  it('returns null for valid name', () => {
    expect(validateGroupName('Barcelona Trip')).toBeNull()
  })
  it('returns null for name with allowed special chars', () => {
    expect(validateGroupName('Trip-2024')).toBeNull()
  })
})

describe('validateMemberName', () => {
  it('returns error for empty name', () => {
    expect(validateMemberName('')).toBeTruthy()
  })
  it('returns error for name shorter than 2 chars', () => {
    expect(validateMemberName('A')).toBeTruthy()
  })
  it('returns error for name with numbers', () => {
    expect(validateMemberName('Alice123')).toBeTruthy()
  })
  it('returns null for valid name', () => {
    expect(validateMemberName('Alice')).toBeNull()
  })
})

describe('validateEmail', () => {
  it('returns null for empty email (optional)', () => {
    expect(validateEmail('')).toBeNull()
  })
  it('returns error for invalid email', () => {
    expect(validateEmail('notanemail')).toBeTruthy()
  })
  it('returns error for missing domain', () => {
    expect(validateEmail('alice@')).toBeTruthy()
  })
  it('returns null for valid email', () => {
    expect(validateEmail('alice@example.com')).toBeNull()
  })
})

describe('validatePassword', () => {
  it('returns error for empty password', () => {
    expect(validatePassword('')).toBeTruthy()
  })
  it('returns error for password shorter than 6 chars', () => {
    expect(validatePassword('abc1')).toBeTruthy()
  })
  it('returns error for password without numbers', () => {
    expect(validatePassword('abcdef')).toBeTruthy()
  })
  it('returns null for valid password', () => {
    expect(validatePassword('password1')).toBeNull()
  })
})

describe('validateAmount', () => {
  it('returns error for empty amount', () => {
    expect(validateAmount('')).toBeTruthy()
  })
  it('returns error for zero', () => {
    expect(validateAmount(0)).toBeTruthy()
  })
  it('returns error for negative amount', () => {
    expect(validateAmount(-5)).toBeTruthy()
  })
  it('returns error for more than 2 decimal places', () => {
    expect(validateAmount('10.123')).toBeTruthy()
  })
  it('returns null for valid amount', () => {
    expect(validateAmount(90)).toBeNull()
  })
  it('returns null for amount with 2 decimal places', () => {
    expect(validateAmount('9.99')).toBeNull()
  })
})