import api from './api.js'

/**
 * Employee Directory Service
 * Maps to: /api/v1/employees
 */

/**
 * GET /api/v1/employees/stats
 * Returns summary counts: total, active, on leave, etc.
 */
export const getEmployeeStats = async () => {
  const { data } = await api.get('/employees/stats')
  return data.data
}

/**
 * GET /api/v1/employees/filters
 * Returns distinct filter option lists: departments, jobTitles, workLocations, workModes, statuses
 */
export const getFilterOptions = async () => {
  const { data } = await api.get('/employees/filters')
  return data.data
}

/**
 * GET /api/v1/employees
 * @param {Object} params
 * @param {number}  [params.page=1]
 * @param {number}  [params.limit=20]
 * @param {string}  [params.search]
 * @param {string}  [params.department]
 * @param {string}  [params.status]
 * @param {string}  [params.workMode]
 * @param {string}  [params.jobTitle]
 * @param {string}  [params.workLocation]
 * @returns {{ employees: Array, total: number, page: number, limit: number, pages: number }}
 */
export const listEmployees = async (params = {}) => {
  const { data } = await api.get('/employees', { params })
  return data.data
}

/**
 * GET /api/v1/employees/:id
 * @param {number} id - Employee record ID
 * @returns {{ employee: Object }}
 */
export const getEmployee = async (id) => {
  const { data } = await api.get(`/employees/${id}`)
  return data.data.employee
}

/**
 * POST /api/v1/employees
 * Requires role: admin | hr_admin
 * @param {Object} payload - Employee fields (see required fields below)
 * Required: empId, fullName, jobTitle, department, employmentType, joinDate, workEmail
 * @returns {{ employee: Object }}
 */
export const createEmployee = async (payload) => {
  const { data } = await api.post('/employees', payload)
  return data.data.employee
}

/**
 * PATCH /api/v1/employees/:id
 * Requires role: admin | hr_admin
 * @param {number} id - Employee record ID
 * @param {Object} payload - Fields to update (all optional)
 * @returns {{ employee: Object }}
 */
export const updateEmployee = async (id, payload) => {
  const { data } = await api.patch(`/employees/${id}`, payload)
  return data.data.employee
}

/**
 * DELETE /api/v1/employees/:id
 * Requires role: admin | hr_admin  (soft delete)
 * @param {number} id - Employee record ID
 */
export const deleteEmployee = async (id) => {
  await api.delete(`/employees/${id}`)
}
