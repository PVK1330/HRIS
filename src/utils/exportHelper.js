const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export function getToken() {
  return localStorage.getItem('hris_token')
}

/**
 * Download an export file from GET /api/v1/:endpoint/export
 * @param {string} endpoint e.g. 'employees', 'departments', 'designations'
 * @param {Record<string, string | number | boolean | undefined | null>} filters query params (excluding type)
 * @param {'pdf'|'excel'} type
 * @param {string} filename suggested download name
 */
export async function triggerExport(endpoint, filters, type, filename) {
  const API_BASE = `${API_URL}/api/v1`
  const params = new URLSearchParams()
  params.set('type', type)
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    params.set(key, String(value))
  })
  const response = await fetch(`${API_BASE}/${endpoint}/export?${params.toString()}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new Error(errText || 'Export failed')
  }
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
