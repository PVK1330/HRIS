import api from './api.js'

const BASE = '/attendance'

/**
 * GET /api/v1/attendance
 * Admin list — all employees for a given date
 */
export const listAttendance = async (params = {}) => {
  const { data } = await api.get(BASE, { params })
  return data.data  // { records, total, summary, date, limit, page }
}

/**
 * POST /api/v1/attendance
 * Manual punch — mark attendance for an employee
 */
export const markAttendance = async (payload) => {
  const { data } = await api.post(BASE, payload)
  return data.data.record
}

/**
 * GET /api/v1/attendance/regularizations
 * All pending regularization requests
 */
export const getPendingRegularizations = async (params = {}) => {
  const { data } = await api.get(`${BASE}/regularizations`, { params })
  return data.data  // { records, total }
}

/**
 * PATCH /api/v1/attendance/:id/regularize
 * Approve or reject a regularization request
 * @param {number} id
 * @param {{ action: 'approve'|'reject', reason?: string }} payload
 */
export const regularize = async (id, payload) => {
  const { data } = await api.patch(`${BASE}/${id}/regularize`, payload)
  return data.data.record
}

/**
 * GET /api/v1/employees/:employeeId/attendance
 * Employee-scoped attendance (used in EmployeeProfile)
 */
export const getEmployeeAttendance = async (employeeId, params = {}) => {
  const { data } = await api.get(`/employees/${employeeId}/attendance`, { params })
  return data.data  // { records, summary, year, month }
}
