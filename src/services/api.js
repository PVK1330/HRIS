import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true, // send httpOnly refresh-token cookie on every request
})

// Request interceptor to attach Authorization header if using Bearer token fallback
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hris_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
// Queue of callers waiting for a refresh in progress
let isRefreshing = false
const refreshSubscribers = []

function notifySubscribers(newToken) {
  while (refreshSubscribers.length) {
    refreshSubscribers.shift()(newToken)
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    const isAuthEndpoint =
      original?.url?.includes('/auth/refresh') ||
      original?.url?.includes('/auth/login') ||
      original?.url?.includes('/superadmin/login') ||
      original?.url?.includes('/superadmin/verify-2fa') ||
      original?.url?.includes('/auth/verify-2fa')

    // Only attempt refresh when we have an access token — a 401 with no token
    // means the caller is unauthenticated, not expired. Trying to refresh in
    // that case causes an infinite loop (no cookie → refresh 401 → redirect →
    // page reload → same unauthenticated request → repeat).
    const isLoggedIn = !!localStorage.getItem('hris_auth_user') || !!localStorage.getItem('hris_token')

    // Detect superadmin sessions — they have a different refresh flow (separate
    // cookie path). Attempting /auth/refresh for a superadmin will always fail
    // and trigger a second unwanted redirect, so we skip straight to logout/redirect.
    const isSuperadminSession = (() => {
      try {
        const raw = localStorage.getItem('hris_auth_user')
        if (!raw) return false
        const u = JSON.parse(raw)
        const role = String(u?.role || '').toLowerCase().replace(/[\s_-]/g, '')
        return role === 'superadmin' || role === 'supportadmin' || role === 'billingadmin'
      } catch {
        return false
      }
    })()

    if (error.response?.status === 401 && !original._retried && !isAuthEndpoint && isLoggedIn) {
      // Superadmin: no refresh endpoint — go straight to login
      if (isSuperadminSession) {
        localStorage.removeItem('hris_auth_user')
        localStorage.removeItem('hris_token')
        localStorage.removeItem('allowedModules')
        delete api.defaults.headers.common.Authorization
        const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || ''
        window.location.replace(`${window.location.origin}${base}/login`)
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Queue this request to retry once the ongoing refresh completes
        return new Promise((resolve, _reject) => {
          refreshSubscribers.push((token) => {
            if (token) {
              original.headers.Authorization = `Bearer ${token}`
            }
            resolve(api(original))
          })
        })
      }

      original._retried = true
      isRefreshing = true

      try {
        const { data } = await api.post('/auth/refresh')
        const newToken = data?.data?.token
        if (!newToken) throw new Error('No token in refresh response')

        // If project uses Bearer token, keep it updated
        if (localStorage.getItem('hris_token') || api.defaults.headers.common.Authorization) {
          localStorage.setItem('hris_token', newToken)
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`
          original.headers.Authorization = `Bearer ${newToken}`
        }

        notifySubscribers(newToken)
        return api(original)
      } catch {
        notifySubscribers(null)
        localStorage.removeItem('hris_auth_user')
        localStorage.removeItem('hris_token')
        localStorage.removeItem('allowedModules')
        delete api.defaults.headers.common.Authorization
        const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || ''
        window.location.replace(`${window.location.origin}${base}/login`)
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default api
