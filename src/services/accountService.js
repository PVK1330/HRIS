import api from './api'

// Self-service account actions for the logged-in user (any profile).

export async function changePassword(currentPassword, newPassword) {
  const { data } = await api.post('/auth/change-password', { currentPassword, newPassword })
  return data.data
}

// Current user's own profile (tenant admin / hr / employee), backed by /auth/me.
export async function getMyAccount() {
  const { data } = await api.get('/auth/me')
  return data.data?.profile ?? null
}

export async function updateMyAccount(payload) {
  const { data } = await api.put('/auth/me', payload)
  return data.data?.profile ?? null
}
