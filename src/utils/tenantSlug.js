/**
 * Slug from company name — must match HRIS_API tenant.controller loginAsTenant / impersonation URLs.
 */
export function slugifyTenantName(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
}

/** e.g. akshu-techologies-pvt-ltd.localhost → akshu-techologies-pvt-ltd */
export function parseTenantSlugFromHostname(hostname) {
  const host = String(hostname || '').toLowerCase().trim()
  if (!host || host === 'localhost' || host === '127.0.0.1') return null

  const parts = host.split('.').filter(Boolean)
  if (parts.length >= 2 && parts[parts.length - 1] === 'localhost') {
    const sub = parts[0]
    if (sub && sub !== 'www' && sub !== 'api') return sub
  }
  if (parts.length > 2) {
    const sub = parts[0]
    if (sub && sub !== 'www' && sub !== 'api') return sub
  }
  return null
}
