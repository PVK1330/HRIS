import api from './api.js'
import { getLeaveTypes } from './adminSettingsService.js'

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

// Re-export for convenience — leave types come from settings
export { getLeaveTypes }
