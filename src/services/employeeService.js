import api from './api.js'
import { computeNextEmpIdFromRecords, formatEmpId, parseEmpIdSequence } from '../utils/employeeId.js'

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

/** Designations for a department (employee.view — no departments.manage). */
export const getDesignationsForDepartment = async (departmentName) => {
  const { data } = await api.get('/employees/designations-for-department', {
    params: { department: departmentName },
  })
  return data.data
}

/**
 * GET /api/v1/employees/next-emp-id
 * Next sequential employee ID (1, 2, 3, …).
 */
export const getNextEmployeeId = async (localRecords = []) => {
  try {
    const { data } = await api.get('/employees/next-emp-id')
    const payload = data?.data ?? data
    const next =
      payload?.nextEmpId ??
      payload?.next_emp_id ??
      payload?.nextId
    if (next != null && String(next).trim() !== '') {
      const raw = String(next).trim()
      const seq = parseEmpIdSequence(raw)
      return seq > 0 ? formatEmpId(seq) : raw
    }
  } catch (err) {
    console.warn('getNextEmployeeId: API failed, using local fallback', err)
  }
  return computeNextEmpIdFromRecords(localRecords)
}

/**
 * GET /api/v1/employees/dropdown?search=
 * Full employee list for dropdowns (id, emp_id, full_name) — no pagination, capped server-side.
 */
export const listEmployeesDropdown = async (params = {}) => {
  const { data } = await api.get('/employees/dropdown', { params })
  return data.data
}

/**
 * GET /api/v1/employees (paginated directory listing)
 * @returns {Promise<{ records: Array, employees: Array, pagination: object, filters?: object, total: number, page: number, limit: number, pages: number }>}
 */
export const listEmployees = async (params = {}) => {
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
  if (p && Array.isArray(p.employees)) {
    return {
      ...p,
      records: p.employees,
      pagination: {
        total: p.total ?? p.employees.length,
        page: p.page ?? 1,
        limit: p.limit ?? p.employees.length,
        totalPages: p.pages ?? 1,
        hasNext: false,
        hasPrev: false,
      },
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

/**
 * GET onboarding candidates (employment_status = Onboarding).
 */
export const listOnboardingEmployees = async (params = {}) => {
  return listEmployees({
    onboardingOnly: true,
    limit: params.limit ?? 500,
    page: params.page ?? 1,
    search: params.search ?? '',
    sortBy: params.sortBy ?? 'created_at',
    sortOrder: params.sortOrder ?? 'desc',
  })
}

/**
 * POST /api/v1/employees/:id/complete-onboarding
 * Activates portal, sets Active, emails work email + random password.
 */
export const completeOnboardingActivation = async (id) => {
  const { data } = await api.post(`/employees/${id}/complete-onboarding`)
  return data.data
}

/** POST — email on onboarding step completed (e.g. step 1 = form submitted). */
export const notifyOnboardingStep = async (id, step = 1) => {
  const { data } = await api.post(`/employees/${id}/onboarding/notify-step`, { step })
  return data.data
}

/** PATCH — Accepted sends HR shared inbox ID proof + resume attachments. */
export const updateOnboardingApproval = async (id, { status, rejectionReason }) => {
  const { data } = await api.patch(`/employees/${id}/onboarding/approval`, {
    status,
    rejectionReason,
  })
  return data.data
}

/** POST — offer letter email to candidate personal email (attachment if uploaded). */
export const sendOnboardingOfferLetter = async (id, payload = {}) => {
  const { data } = await api.post(`/employees/${id}/onboarding/send-offer-letter`, payload)
  return data.data
}

export const getOnboardingChecklist = async (id) => {
  const { data } = await api.get(`/employees/${id}/onboarding/checklist`)
  return data.data
}

export const reviewOnboardingChecklistItem = async (employeeId, itemId, payload) => {
  const { data } = await api.patch(
    `/employees/${employeeId}/onboarding/checklist/${itemId}/review`,
    payload,
  )
  return data.data
}

export const uploadSignedOfferByHr = async (id, file) => {
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await api.post(`/employees/${id}/onboarding/signed-offer`, fd)
  return data.data
}

export const completeOnboardingWorkflow = async (id) => {
  const { data } = await api.post(`/employees/${id}/onboarding/complete`)
  return data.data
}
