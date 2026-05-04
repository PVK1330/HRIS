import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const BASE = `${API_URL}/api/v1/settings`

const TOKEN_KEYS = ['elitepic_auth_token', 'token', 'jwt']

function readToken() {
  if (typeof window === 'undefined') return null
  for (const k of TOKEN_KEYS) {
    const v = window.localStorage.getItem(k)
    if (v) return v
  }
  return null
}

const client = axios.create({ baseURL: BASE })

client.interceptors.request.use((config) => {
  const token = readToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
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
)

export const settingsService = {
  /* -------------------- General -------------------- */
  getGeneral: () => client.get('/general').then((r) => r.data),
  updateGeneral: (payload) => client.put('/general', payload).then((r) => r.data),

  /* -------------------- Company -------------------- */
  getCompany: () => client.get('/company').then((r) => r.data),
  updateCompany: (payload) => client.put('/company', payload).then((r) => r.data),

  /* -------------------- Email -------------------- */
  getEmail: () => client.get('/email').then((r) => r.data),
  updateEmail: (payload) => client.put('/email', payload).then((r) => r.data),
  sendTestEmail: ({ sendTo }) =>
    client.post('/email/test', { sendTo }).then((r) => r.data),

  /* -------------------- Email Templates -------------------- */
  getTemplates: () => client.get('/email/templates').then((r) => r.data),
  getTemplate: (slug) =>
    client.get(`/email/templates/${encodeURIComponent(slug)}`).then((r) => r.data),
  updateTemplate: (slug, payload) =>
    client
      .put(`/email/templates/${encodeURIComponent(slug)}`, payload)
      .then((r) => r.data),

  /* -------------------- Logo -------------------- */
  getLogo: () => client.get('/logo').then((r) => r.data),

  /**
   * Uploads a logo via multipart/form-data.
   * @param {'large'|'small'|'favicon'} type
   * @param {FormData} formData  must contain a `logo` field
   */
  uploadLogo: (type, formData) =>
    client
      .post(`/logo/${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

  /* -------------------- System -------------------- */
  getSystem: () => client.get('/system').then((r) => r.data),
}

export default settingsService
