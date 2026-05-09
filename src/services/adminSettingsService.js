import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const ADMIN_BASE = `${API_URL}/api/v1/admin/settings`

const TOKEN_KEYS = ['hris_token', 'elitepic_auth_token', 'token', 'jwt']

function readToken() {
  if (typeof window === 'undefined') return null
  for (const k of TOKEN_KEYS) {
    const v = window.localStorage.getItem(k)
    if (v) return v
  }
  return null
}

function unwrapError(err) {
  const apiMsg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    'Request failed'
  const wrapped = new Error(apiMsg)
  wrapped.status = err?.response?.status
  wrapped.data = err?.response?.data
  return Promise.reject(wrapped)
}

const adminClient = axios.create({ baseURL: ADMIN_BASE })

adminClient.interceptors.request.use((config) => {
  const token = readToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

adminClient.interceptors.response.use((res) => res, unwrapError)

export async function getPasswordSecurity() {
  const { data } = await adminClient.get('/password-security')
  return data
}

export async function updatePasswordSecurity(payload) {
  const { data } = await adminClient.put('/password-security', payload)
  return data
}

export async function getNotifications() {
  const { data } = await adminClient.get('/notifications')
  return data
}

export async function updateNotifications(payload) {
  const { data } = await adminClient.put('/notifications', payload)
  return data
}

export async function updateEventNotification(eventKey, patch) {
  const { data } = await adminClient.patch(`/notifications/events/${eventKey}`, patch)
  return data
}

export async function getDocumentTypes() {
  const { data } = await adminClient.get('/documents')
  return data
}

export async function getDocumentType(id) {
  const { data } = await adminClient.get(`/documents/${id}`)
  return data
}

export async function createDocumentType(payload) {
  const { data } = await adminClient.post('/documents', payload)
  return data
}

export async function updateDocumentType(id, payload) {
  const { data } = await adminClient.put(`/documents/${id}`, payload)
  return data
}

export async function deleteDocumentType(id) {
  const { data } = await adminClient.delete(`/documents/${id}`)
  return data
}

export async function getSensitiveData() {
  const { data } = await adminClient.get('/sensitive-data')
  return data
}

export async function updateSensitiveData(payload) {
  const { data } = await adminClient.put('/sensitive-data', payload)
  return data
}
