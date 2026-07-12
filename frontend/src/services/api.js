import { authHeaders } from './token.js'

const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api"

// Auth
export async function register(name, email, password) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Registration failed')
  }
  return res.json()
}

export async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Login failed')
  }
  return res.json()
}

// Groups
export async function createGroup(name) {
  const res = await fetch(`${BASE}/groups`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error("Failed to create group")
  return res.json()
}

export async function getGroup(groupId) {
  const res = await fetch(`${BASE}/groups/id/${groupId}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch group")
  return res.json()
}

export async function getGroupByInviteCode(inviteCode) {
  const res = await fetch(`${BASE}/groups/${inviteCode}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Group not found")
  return res.json()
}

// Users
export async function getGroupUsers(groupId) {
  const res = await fetch(`${BASE}/groups/${groupId}/users`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch group users")
  return res.json()
}

export async function addUserToGroup(groupId, userData) {
  const res = await fetch(`${BASE}/groups/${groupId}/users`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(userData),
  })
  if (!res.ok) throw new Error("Failed to add user")
  return res.json()
}

export async function joinGroupByInviteCode(inviteCode, userData) {
  const group = await getGroupByInviteCode(inviteCode)
  const user = await addUserToGroup(group.id, userData)
  return { ...user, group_id: group.id }
}

// Expenses
export async function addExpense(groupId, expenseData) {
  const res = await fetch(`${BASE}/groups/${groupId}/expenses`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(expenseData),
  })
  if (!res.ok) throw new Error('Failed to add expense')
  return res.json()
}

export async function getExpenses(groupId) {
  const res = await fetch(`${BASE}/groups/${groupId}/expenses`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch expenses')
  return res.json()
}

export async function recalculateSplits(groupId) {
  const res = await fetch(`${BASE}/groups/${groupId}/expenses/recalculate`, {
    method: 'POST',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to recalculate splits')
  return res.json()
}

export async function deleteExpense(groupId, expenseId) {
  const res = await fetch(`${BASE}/groups/${groupId}/expenses/${expenseId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to delete expense')
  return res.json()
}

// Settlements
export async function getSettlements(groupId) {
  const res = await fetch(`${BASE}/groups/${groupId}/settlements`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch settlements")
  return res.json()
}

export async function confirmSettlement(groupId, from_name, to_name, amount) {
  const res = await fetch(`${BASE}/groups/${groupId}/settlements/confirm`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ from_name, to_name, amount }),
  })
  if (!res.ok) throw new Error('Failed to confirm settlement')
  return res.json()
}

export async function getConfirmedSettlements(groupId) {
  const res = await fetch(`${BASE}/groups/${groupId}/settlements/confirmed`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch confirmed settlements')
  return res.json()
}

// Donations
export async function getDonations() {
  const res = await fetch(`${BASE}/donations`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch donations");
  return res.json();
}

export async function recordDonation(groupId, orgName, amount, paidBy) {
  const res = await fetch(`${BASE}/groups/${groupId}/expenses`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      title: `🎗️ Donation — ${orgName}`,
      amount: Number(amount),
      paid_by: Number(paidBy),
    }),
  })
  if (!res.ok) throw new Error('Failed to record donation')
  return res.json()
}