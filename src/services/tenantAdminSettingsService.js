import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const BASE = `${API_URL}/api/v1/admin/settings`

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

const client = axios.create({ baseURL: BASE })

client.interceptors.request.use((config) => {
  const token = readToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use((res) => res, unwrapError)

/** @returns {Promise<{ success: boolean, data: object }>} */
export async function fetchTenantAdminSettings() {
  const { data } = await client.get('/')
  return data
}

/** @returns {Promise<{ success: boolean, message?: string, data: object }>} */
export async function updateTenantAdminSettings(payload) {
  const { data } = await client.put('/', payload)
  return data
}

/** @returns {Promise<{ success: boolean, message?: string, data: { logoUrl: string } }>} */
export async function uploadTenantLogo(file) {
  const fd = new FormData()
  fd.append('logo', file)
  const token = readToken()
  try {
    const { data } = await axios.post(`${BASE}/logo`, fd, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
    return data
  } catch (err) {
    return unwrapError(err)
  }
}

export function getTenantLogoAbsoluteUrl(relativePath) {
  if (!relativePath || typeof relativePath !== 'string') return ''
  if (relativePath.startsWith('http')) return relativePath
  return `${API_URL.replace(/\/$/, '')}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`
}

export { API_URL }
