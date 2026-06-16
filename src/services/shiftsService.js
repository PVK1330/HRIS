const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const TOKEN_KEYS = ['hris_token', 'elitepic_auth_token', 'token', 'jwt']

function getToken() {
  for (const key of TOKEN_KEYS) {
    const t = localStorage.getItem(key)
    if (t) return t
  }
  return null
}

function authHeaders() {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function listActiveShifts() {
  const res = await fetch(`${API_URL}/api/v1/shifts`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch shifts: ${res.status}`)
  const json = await res.json()
  const rows = Array.isArray(json) ? json : (json?.data ?? [])
  return rows
}
