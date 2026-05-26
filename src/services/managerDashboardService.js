import api from './api'

/**
 * Manager Dashboard Service
 * Handles manager-specific data retrieval
 */

/**
 * GET /api/v1/manager/department
 * Get the department assigned to the logged-in manager
 * @returns {Promise<{department: {id, name, code, description, managerId, employeeCount}}>}
 */
export const getManagerDepartment = async () => {
  try {
    const { data } = await api.get('/manager/performance/department')
    return data.data?.department || null
  } catch (err) {
    console.error('Error fetching manager department:', err)
    throw err
  }
}

/**
 * GET /api/v1/employees?department_id=X
 * List employees in manager's department with pagination and filtering
 */
export const getManagerEmployees = async (params = {}) => {
  try {
    const { data } = await api.get('/employees', { params })
    const p = data.data
    if (p && Array.isArray(p.records)) {
      const total = p.pagination?.total ?? 0
      const page = p.pagination?.page ?? 1
      const limit = p.pagination?.limit ?? 10
      const pages = p.pagination?.totalPages ?? 1
      return {
        ...p,
        employees: p.records,
        total,
        page,
        limit,
        pages,
      }
    }
    return {
      records: [],
      employees: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false },
      total: 0,
      page: 1,
      limit: 10,
      pages: 1,
    }
  } catch (err) {
    console.error('Error fetching manager employees:', err)
    throw err
  }
}
