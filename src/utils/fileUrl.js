// Central resolver for file/upload URLs the app renders (<img>, <a href>, iframe, window.open).
//
// Private files under /uploads are now auth-gated on the API and accept a JWT either via the
// Authorization header or a `?token=<jwt>` query param. Since browser-initiated GETs for images,
// links, iframes and window.open can't set headers, we append the token as a query param.
//
// Public branding paths stay open and must NOT receive a token.

const API_ORIGIN = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Upload paths that are public (branding) and must never get a token.
const PUBLIC_UPLOAD_PREFIXES = [
  '/uploads/logos',
  '/uploads/tenant-logos',
  '/uploads/superadmin-logos',
]

/**
 * Resolve a stored file path or URL into a renderable URL.
 *
 * - Falsy or '#' is returned unchanged.
 * - Absolute http(s) URLs keep their origin; relative paths are prefixed with the API origin.
 * - Public branding uploads are returned without a token.
 * - Other /uploads/* URLs get `?token=<hris_token>` appended (header `&`/`?` aware).
 * - Non-upload URLs are returned as-is (only origin-prefixed if they were relative).
 *
 * @param {string} pathOrUrl
 * @returns {string}
 */
export function resolveFileUrl(pathOrUrl) {
  if (!pathOrUrl || pathOrUrl === '#') return pathOrUrl

  const raw = String(pathOrUrl)
  const isAbsolute = /^https?:\/\//i.test(raw)

  // Build a full URL so we can inspect/parse the pathname reliably.
  let fullUrl
  if (isAbsolute) {
    fullUrl = raw
  } else {
    fullUrl = `${API_ORIGIN}${raw.startsWith('/') ? raw : `/${raw}`}`
  }

  // Determine the pathname (without query/hash) for prefix checks.
  let pathname
  try {
    pathname = new URL(fullUrl).pathname
  } catch {
    // Fall back to stripping query/hash manually if URL parsing fails.
    pathname = fullUrl.split('#')[0].split('?')[0]
  }

  // Public branding paths -> no token.
  if (PUBLIC_UPLOAD_PREFIXES.some((p) => pathname.startsWith(p))) {
    return fullUrl
  }

  // Private uploads -> append token (if available).
  if (pathname.includes('/uploads/')) {
    const token = localStorage.getItem('hris_token')
    if (!token) return fullUrl
    const sep = fullUrl.includes('?') ? '&' : '?'
    return `${fullUrl}${sep}token=${encodeURIComponent(token)}`
  }

  // Non-upload URL.
  return fullUrl
}

export default resolveFileUrl
