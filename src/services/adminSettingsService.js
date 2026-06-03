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

const SETTINGS_CLIENT_BASE = `${API_URL}/api/v1/settings`
const settingsClient = axios.create({ baseURL: SETTINGS_CLIENT_BASE })

settingsClient.interceptors.request.use((config) => {
  const token = readToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

settingsClient.interceptors.response.use((res) => res, unwrapError)

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

export async function getLeaveTypes() {
  const { data } = await adminClient.get('/leave-types')
  return data
}

export async function getLeaveType(id) {
  const { data } = await adminClient.get(`/leave-types/${id}`)
  return data
}

export async function createLeaveType(payload) {
  const { data } = await adminClient.post('/leave-types', payload)
  return data
}

export async function updateLeaveType(id, payload) {
  const { data } = await adminClient.put(`/leave-types/${id}`, payload)
  return data
}

export async function deleteLeaveType(id) {
  const { data } = await adminClient.delete(`/leave-types/${id}`)
  return data
}

export const adminSettingsService = {
  getTenantLogo: () => adminClient.get('/logo'),
  uploadTenantLogo: (formData) =>
    adminClient.post('/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getSuperadminLogo: () => settingsClient.get('/logo'),
  uploadSuperadminLogo: (type, formData) =>
    settingsClient.post(`/logo/${type}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getAllPermissions: () => adminClient.get('/rbac/permissions'),
  getAvailablePermissions: () => adminClient.get('/rbac/permissions/available'),
  getAllRoles: () => adminClient.get('/rbac/roles'),
  getRole: (id) => adminClient.get(`/rbac/roles/${id}`),
  createRole: (data) => adminClient.post('/rbac/roles', data),
  updateRole: (id, data) => adminClient.put(`/rbac/roles/${id}`, data),
  deleteRole: (id) => adminClient.delete(`/rbac/roles/${id}`),
  updateRolePermissions: (roleId, permissionIds, scope) =>
    adminClient.put(`/rbac/roles/${roleId}/permissions`, {
      permissionIds,
      ...(scope != null ? { scope } : {}),
    }),

  getOnboardingHandoverRules: () =>
    axios.get(`${API_URL}/api/v1/admin/settings/onboarding/handover-rules`, {
      headers: { Authorization: `Bearer ${readToken()}` },
    }),
  createOnboardingHandoverRule: (body) =>
    axios.post(`${API_URL}/api/v1/admin/settings/onboarding/handover-rules`, body, {
      headers: { Authorization: `Bearer ${readToken()}` },
    }),
  updateOnboardingHandoverRule: (id, body) =>
    axios.put(`${API_URL}/api/v1/admin/settings/onboarding/handover-rules/${id}`, body, {
      headers: { Authorization: `Bearer ${readToken()}` },
    }),
  deleteOnboardingHandoverRule: (id) =>
    axios.delete(`${API_URL}/api/v1/admin/settings/onboarding/handover-rules/${id}`, {
      headers: { Authorization: `Bearer ${readToken()}` },
    }),
}
