let token = null

export function setToken(t) { token = t }
export function getToken() { return token }
export function clearToken() { token = null }

export function authHeaders() {
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' }
}