import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const BASE = `${API_URL}/api/v1/admin/settings/geo-fencing`

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

export async function fetchGeoFenceSettings() {
  const { data } = await client.get('/')
  return data?.data ?? data
}

export async function updateGeoFenceSettings(payload) {
  const { data } = await client.put('/', payload)
  return data?.data ?? data
}
