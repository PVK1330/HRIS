import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const BASE = `${API_URL}/api/v1/settings`
const API_V1 = `${API_URL}/api/v1`

const TOKEN_KEYS = ['hris_token', 'elitepic_auth_token', 'token', 'jwt']

function readToken() {
  if (typeof window === 'undefined') return null
  for (const k of TOKEN_KEYS) {
    const v = window.localStorage.getItem(k)
    if (v) return v
  }
  return null
}

function attachAuth(config) {
  const token = readToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
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
client.interceptors.request.use(attachAuth)
client.interceptors.response.use((res) => res, unwrapError)

// Sibling API surface (payment-gateways, recaptcha, free-trial live under
// /api/v1, not under /api/v1/settings) — same auth + error rules.
const apiV1 = axios.create({ baseURL: API_V1 })
apiV1.interceptors.request.use(attachAuth)
apiV1.interceptors.response.use((res) => res, unwrapError)

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
  getEmailLogs: () => client.get('/email/logs').then((r) => r.data),
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
  getSettingsMeta: () => client.get('/meta').then((r) => r.data),

  /* -------------------- Payment Gateways -------------------- */
  // The backend is a per-slug REST API returning an array of gateways with
  // snake_case credentials. These adapters map that to/from the page's
  // { stripe, paypal } camelCase shape.
  getPaymentGateways: async () => {
    const body = await apiV1.get('/payment-gateways').then((r) => r.data)
    const list = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : []
    const bySlug = Object.fromEntries(list.map((g) => [g.slug, g]))
    const s = bySlug.stripe || {}
    const p = bySlug.paypal || {}
    const sCred = s.credentials || {}
    const pCred = p.credentials || {}
    return {
      data: {
        stripe: {
          enabled: !!s.isEnabled,
          publicKey: sCred.publishable_key || '',
          secretKey: sCred.secret_key || '',
          webhookSecret: sCred.webhook_secret || '',
        },
        paypal: {
          enabled: !!p.isEnabled,
          clientId: pCred.client_id || '',
          clientSecret: pCred.client_secret || '',
          mode: pCred.mode || 'sandbox',
          paypalCurrency: pCred.paypal_currency || 'USD',
        },
      },
    }
  },
  updatePaymentGateways: async ({ stripe, paypal } = {}) => {
    const calls = []
    if (stripe) {
      calls.push(
        apiV1.put('/payment-gateways/stripe', {
          isEnabled: !!stripe.enabled,
          credentials: {
            publishable_key: stripe.publicKey || '',
            secret_key: stripe.secretKey || '',
            webhook_secret: stripe.webhookSecret || '',
          },
        }),
      )
    }
    if (paypal) {
      calls.push(
        apiV1.put('/payment-gateways/paypal', {
          isEnabled: !!paypal.enabled,
          testMode: paypal.mode === 'sandbox',
          credentials: {
            client_id: paypal.clientId || '',
            client_secret: paypal.clientSecret || '',
            mode: paypal.mode || 'sandbox',
            paypal_currency: (paypal.paypalCurrency || 'USD').toUpperCase(),
          },
        }),
      )
    }
    await Promise.all(calls)
    return { success: true }
  },
  getEnabledPaymentGateways: () =>
    apiV1.get('/payment-gateways/enabled').then((r) => r.data),
  getPaymentGateway: (slug) =>
    apiV1.get(`/payment-gateways/${encodeURIComponent(slug)}`).then((r) => r.data),
  updatePaymentGateway: (slug, payload) =>
    apiV1.put(`/payment-gateways/${encodeURIComponent(slug)}`, payload).then((r) => r.data),
  testPaymentGateway: (slug) =>
    apiV1
      .post(`/payment-gateways/${encodeURIComponent(String(slug).toLowerCase())}/test`)
      .then((r) => r.data),

  /* -------------------- reCAPTCHA -------------------- */
  getRecaptcha: () => apiV1.get('/recaptcha').then((r) => r.data),
  updateRecaptcha: (payload) => apiV1.put('/recaptcha', payload).then((r) => r.data),
  testRecaptcha: () => apiV1.post('/recaptcha/test').then((r) => r.data),

  /* -------------------- Free Trial -------------------- */
  getFreeTrial: () => apiV1.get('/free-trial').then((r) => r.data),
  updateFreeTrial: (payload) => apiV1.put('/free-trial', payload).then((r) => r.data),

  /* -------------------- Account Settings -------------------- */
  getAccountSettings: () => apiV1.get('/account-settings').then((r) => r.data),
  updateAccountSettings: (payload) =>
    apiV1.put('/account-settings', payload).then((r) => r.data),

  /* -------------------- Currency -------------------- */
  getCurrency: () => apiV1.get('/currency').then((r) => r.data),
  updateCurrency: (payload) => apiV1.put('/currency', payload).then((r) => r.data),
  refreshCurrencyRates: () => apiV1.post('/currency/refresh-rates').then((r) => r.data),
}

export default settingsService
