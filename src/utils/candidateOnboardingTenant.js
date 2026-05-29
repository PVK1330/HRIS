/**
 * Resolve tenant for public candidate onboarding API calls.
 * Email links must include ?tenant=<schema_slug> when not using a tenant subdomain.
 */
export function getCandidateTenantId() {
  if (typeof window === 'undefined') return null

  const fromQuery = new URLSearchParams(window.location.search).get('tenant')
  if (fromQuery) return fromQuery

  const host = window.location.hostname || ''
  const parts = host.split('.')
  if (parts.length >= 2 && (parts[parts.length - 1] === 'localhost' || parts.length > 2)) {
    const sub = parts[0]
    if (sub && sub !== 'www' && sub !== 'api') {
      return sub
    }
  }

  return null
}

export function candidateOnboardingHeaders() {
  const tenant = getCandidateTenantId()
  return tenant ? { 'X-Tenant-Id': tenant } : {}
}

/** Build onboarding path preserving token + tenant query params. */
export function candidateOnboardingPath(path, token) {
  const params = new URLSearchParams()
  if (token) params.set('token', token)
  const tenant = getCandidateTenantId()
  if (tenant) params.set('tenant', tenant)
  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}
