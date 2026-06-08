import api from './api.js'

const BASE = '/leave'

/**
 * GET /api/v1/leave
 * Admin list — all leave requests with stats
 */
export const listLeave = async (params = {}) => {
  const { data } = await api.get(BASE, { params })
  return data.data  // { requests, total, stats, year, limit, page }
}

/**
 * POST /api/v1/leave
 * Apply leave on behalf of an employee (admin)
 */
export const applyLeave = async (payload) => {
  const { data } = await api.post(BASE, payload)
  return data.data.request
}

/**
 * PATCH /api/v1/leave/:id
 * Approve / reject / cancel a leave request
 * @param {number} id
 * @param {{ action: 'approve'|'reject'|'cancel', reason?: string }} payload
 */
export const processLeave = async (id, payload) => {
  const { data } = await api.patch(`${BASE}/${id}`, payload)
  return data.data.request
}

/**
 * GET /api/v1/leave/balances
 * All employee leave balances for a year
 */
export const listBalances = async (params = {}) => {
  const { data } = await api.get(`${BASE}/balances`, { params })
  return data.data  // { balances, year }
}

/**
 * GET /api/v1/employees/:employeeId/leave
 * Employee-scoped leave (used in EmployeeProfile)
 */
export const getEmployeeLeave = async (employeeId, params = {}) => {
  const { data } = await api.get(`/employees/${employeeId}/leave`, { params })
  return data.data  // { requests, balances, year }
}

/**
 * GET /api/v1/leave/types
 * Active leave types for dropdowns (unprivileged)
 */
export const getLeaveTypes = async () => {
  const { data } = await api.get(`${BASE}/types`)
  return data
}

/**
 * GET /api/v1/leave/export/{excel|pdf}
 * Branded, role-scoped download. Triggers a browser file download.
 */
export const exportLeave = async (format = 'excel', params = {}) => {
  const path = format === 'pdf' ? `${BASE}/export/pdf` : `${BASE}/export/excel`
  const res = await api.get(path, { params, responseType: 'blob' })
  const blob = new Blob([res.data], { type: res.headers['content-type'] })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const cd = res.headers['content-disposition'] || ''
  const match = cd.match(/filename="?([^"]+)"?/)
  a.download = match ? match[1] : `leave-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
