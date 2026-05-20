/**
 * ============================================================================
 * Performance Assessment API Service
 * ============================================================================
 * Frontend service for making API calls to Employee Performance Assessments
 * ============================================================================
 */

import api from './api'

const BASE_URL = 'employee-performance'

/** Get all assessments with optional search/page */
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

/** Create assessment */
const createAssessment = async (data) => {
  const response = await api.post(BASE_URL, data)
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

/** Delete assessment */
const deleteAssessment = async (id) => {
  const response = await api.delete(`${BASE_URL}/${id}`)
  return response.data
}

/** Get metrics summary */
const getSummary = async () => {
  const response = await api.get(`${BASE_URL}/summary`)
  return response.data
}

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

export default {
  getAllAssessments,
  createAssessment,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  getSummary,
  getEmployeeAssessments,
  getEmployeePerformanceSummary,
  getCyclesDropdown,
  getCompetenciesDropdown,
  getEmployeesDropdown
}
