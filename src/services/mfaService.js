import api from './api'

// Self-service two-factor (TOTP / authenticator app) for the logged-in user.

export async function getMfaStatus() {
  const { data } = await api.get('/auth/mfa/status')
  return data.data // { enabled, pending }
}

export async function setupMfa() {
  const { data } = await api.post('/auth/mfa/setup')
  return data.data // { secret, otpauthUrl, qrDataUrl }
}

export async function enableMfa(code) {
  const { data } = await api.post('/auth/mfa/enable', { code })
  return data.data // { enabled: true }
}

export async function disableMfa(code) {
  const { data } = await api.post('/auth/mfa/disable', { code })
  return data.data // { enabled: false }
}
