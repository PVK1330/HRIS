import api from './api'

// Self-service account actions for the logged-in user (any profile).

export async function changePassword(currentPassword, newPassword) {
  const { data } = await api.post('/auth/change-password', { currentPassword, newPassword })
  return data.data
}
