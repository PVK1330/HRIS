/**
 * ============================================================================
 * Performance Assessment API Service
 * ============================================================================
 * Frontend service for making API calls to Employee Performance Assessments
 * ============================================================================
 */

import api from './api'

const BASE_URL = 'employee-performance'

// ============================================================================
// ADMIN ASSESSMENT MANAGEMENT
// ============================================================================

/** Create assessment (admin) */
const createAssessment = async (data) => {
  const response = await api.post(`${BASE_URL}`, data)
  return response.data
}

/** Get all assessments (admin) */
const getAllAssessments = async (options = {}) => {
  const { search = '', page = 1, limit = 100, sortBy = 'created_at', sortOrder = 'DESC' } = options
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  params.append('page', page)
  params.append('limit', limit)
  params.append('sortBy', sortBy)
  params.append('sortOrder', sortOrder)

  const response = await api.get(`${BASE_URL}?${params.toString()}`)
  return response.data
}

/** Create bulk assessments */
const createBulkAssessments = async (data) => {
  const response = await api.post(`${BASE_URL}/bulk`, data)
  return response.data
}

/** Get assessment by ID */
const getAssessmentById = async (id) => {
  const response = await api.get(`${BASE_URL}/${id}`)
  return response.data
}

/** Update assessment */
const updateAssessment = async (id, data) => {
  const response = await api.put(`${BASE_URL}/${id}`, data)
  return response.data
}

/** Approve assessment (admin) */
const approveAssessment = async (id) => {
  const response = await api.patch(`${BASE_URL}/${id}/approve`)
  return response.data
}

/** Delete assessment */
const deleteAssessment = async (id) => {
  const response = await api.delete(`${BASE_URL}/${id}`)
  return response.data
}

// ============================================================================
// MANAGER PERFORMANCE PORTAL
// ============================================================================

/** Get performance assessments assigned to logged-in manager (NEW ENDPOINT) */
const getManagerAssignedAssessments = async (options = {}) => {
  const { search = '', page = 1, limit = 100, sortBy = 'created_at', sortOrder = 'DESC' } = options
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  params.append('page', page)
  params.append('limit', limit)
  params.append('sortBy', sortBy)
  params.append('sortOrder', sortOrder)

  const response = await api.get(`${BASE_URL}/manager?${params.toString()}`)
  return response.data
}

/** Update manager goals for an assessment (NEW ENDPOINT) */
const updateManagerGoalsForAssessment = async (id, managerGoals) => {
  const response = await api.patch(`${BASE_URL}/${id}/manager-goals`, managerGoals)
  return response.data
}

/** Get performance reviews assigned to logged-in manager (LEGACY - keep for backward compatibility) */
const getManagerReviews = async (options = {}) => {
  const { search = '', page = 1, limit = 100, sortBy = 'created_at', sortOrder = 'DESC' } = options
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  params.append('page', page)
  params.append('limit', limit)
  params.append('sortBy', sortBy)
  params.append('sortOrder', sortOrder)

  const response = await api.get(`manager/performance/reviews?${params.toString()}`)
  return response.data
}

/** Get single performance review details for manager (LEGACY) */
const getManagerReviewDetails = async (id) => {
  const response = await api.get(`manager/performance/reviews/${id}`)
  return response.data
}

/** Update manager goals for an assessment (LEGACY alias — delegates to the real
 *  PATCH endpoint; the old PUT path had no backend route and always 404'd). */
const updateManagerGoals = async (id, managerGoals) => {
  const response = await api.patch(`${BASE_URL}/${id}/manager-goals`, managerGoals)
  return response.data
}

// Legacy alias for existing page usage
const getManagerAssessments = async (options = {}) => getManagerReviews(options)
const getManagerAssessmentDetails = async (id) => getManagerReviewDetails(id)

// ============================================================================
// DROPDOWN & SUMMARY APIs
// ============================================================================

/** Get metrics summary */
const getSummary = async () => {
  const response = await api.get(`${BASE_URL}/summary`)
  return response.data
}

/** Get aggregated analytics for the Performance Reports dashboard */
const getAnalytics = async () => {
  const response = await api.get(`${BASE_URL}/analytics`)
  return response.data
}

/** Dropdowns */
const getCyclesDropdown = async () => {
  const response = await api.get('performance-cycles/dropdown')
  return response.data
}

const getCompetenciesDropdown = async () => {
  const response = await api.get('competencies/dropdown')
  return response.data
}

const getEmployeesDropdown = async () => {
  const response = await api.get('employees/dropdown')
  return response.data
}

// ============================================================================
// EMPLOYEE PORTAL
// ============================================================================

/** Get assessments for a specific employee */
const getEmployeeAssessments = async (employeeId) => {
  const response = await api.get(`${BASE_URL}/employee/${employeeId}`)
  return response.data
}

/** Get performance summary for a specific employee */
const getEmployeePerformanceSummary = async (employeeId) => {
  const response = await api.get(`${BASE_URL}/performance-summary/${employeeId}`)
  return response.data
}

/** Get my assessments (logged-in employee) */
const getMyAssessments = async () => {
  const response = await api.get(`${BASE_URL}/employee/my-assessments`)
  return response.data
}

/** Update employee progress for an assessment */
const updateEmployeeProgress = async (id, data) => {
  const response = await api.put(`${BASE_URL}/${id}/progress`, data)
  return response.data
}

/** Get all performance cycles for export */
const getPerformanceCycles = async () => {
  const response = await api.get('/performance/cycles')
  return response.data
}

/** Export performance data */
const exportPerformanceData = async (filters, exportType) => {
  const response = await api.post('/performance/export', {
    ...filters,
    exportType
  }, {
    responseType: 'blob'
  })
  return response
}

export default {
  createAssessment,
  getAllAssessments,
  createBulkAssessments,
  getAssessmentById,
  updateAssessment,
  approveAssessment,
  deleteAssessment,
  getSummary,
  getAnalytics,
  getManagerAssignedAssessments,
  updateManagerGoalsForAssessment,
  getManagerAssessments,
  getManagerAssessmentDetails,
  updateManagerGoals,
  getCyclesDropdown,
  getCompetenciesDropdown,
  getEmployeesDropdown,
  getEmployeeAssessments,
  getEmployeePerformanceSummary,
  getMyAssessments,
  getManagerReviews,
  updateEmployeeProgress,
  getPerformanceCycles,
  exportPerformanceData
}

