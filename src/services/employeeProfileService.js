import api from './api.js'

/**
 * Employee Profile Service
 * All endpoints are scoped to a specific employee: /api/v1/employees/:employeeId/...
 */

/**
 * GET /api/v1/employees/:id
 * Full employee record (personal, job, visa, career fields)
 */
export const getEmployeeProfile = async (id) => {
  const { data } = await api.get(`/employees/${id}`)
  return data.data.employee
}

/**
 * GET /api/v1/employees/:employeeId/attendance
 * @param {number} employeeId
 * @param {{ year?: number, month?: number }} params
 * @returns {{ records: Array, summary: Object, year: number, month: number }}
 */
export const getAttendance = async (employeeId, params = {}) => {
  const { data } = await api.get(`/employees/${employeeId}/attendance`, { params })
  return data.data
}

/**
 * GET /api/v1/employees/:employeeId/leave
 * @param {number} employeeId
 * @param {{ year?: number, status?: string }} params
 * @returns {{ requests: Array, balances: Array, year: number }}
 */
export const getLeave = async (employeeId, params = {}) => {
  const { data } = await api.get(`/employees/${employeeId}/leave`, { params })
  return data.data
}

/**
 * GET /api/v1/employees/:employeeId/documents
 * @param {number} employeeId
 * @returns {{ documents: Array }}
 */
export const getDocuments = async (employeeId) => {
  const { data } = await api.get(`/employees/${employeeId}/documents`)
  return data.data
}

/**
 * GET /api/v1/employees/:employeeId/documents/catalog
 * Active document type names from tenant settings (for upload picker).
 */
export const getEmployeeDocumentCatalog = async (employeeId) => {
  const { data } = await api.get(`/employees/${employeeId}/documents/catalog`)
  return data.data
}

/**
 * POST /api/v1/employees/:employeeId/documents (multipart)
 * @param {number} employeeId
 * @param {FormData} formData — must include `file`; optional text fields per API
 */
export const uploadEmployeeDocument = async (employeeId, formData) => {
  try {
    const { data } = await api.post(`/employees/${employeeId}/documents`, formData)
    return data.data
  } catch (err) {
    const apiErr = err?.response?.data?.errors
    const fieldMsg =
      Array.isArray(apiErr) && apiErr.length
        ? apiErr.map((e) => `${e.field || ''}: ${e.message || ''}`.trim()).join(' · ')
        : null
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      fieldMsg ||
      err?.message ||
      'Upload failed'
    throw new Error(msg)
  }
}

/**
 * GET /api/v1/employees/:employeeId/performance
 * @param {number} employeeId
 * @returns {{ reviews: Array, latest: Object|null }}
 */
export const getPerformance = async (employeeId) => {
  const { data } = await api.get(`/employees/${employeeId}/performance`)
  return data.data
}

/**
 * GET /api/v1/employees/:employeeId/assets
 * @param {number} employeeId
 * @returns {{ assets: Array, counts: { active: number, total: number } }}
 */
export const getAssets = async (employeeId) => {
  const { data } = await api.get(`/employees/${employeeId}/assets`)
  return data.data
}
