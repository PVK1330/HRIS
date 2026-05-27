/**
 * ============================================================================
 * Competencies API Service
 * ============================================================================
 * Frontend service for making API calls to competencies backend
 * Provides methods for creating, reading, and deleting competencies
 * 
 * Usage:
 * import competenciesAPI from '@/services/competenciesAPI'
 * ============================================================================
 */

import api from './api' // Axios API client

const BASE_URL = 'competencies'

/**
 * Get all competencies with optional search
 * 
 * @param {Object} options - Query options
 * @param {string} options.search - Search term for competency name (optional)
 * @returns {Promise<Object>} Response with competencies array
 */
const getAllCompetencies = async (options = {}) => {
  const { search = '' } = options
  const params = new URLSearchParams()
  if (search) params.append('search', search)

  const response = await api.get(`${BASE_URL}?${params.toString()}`)
  return response.data
}

/**
 * Create a new competency
 * 
 * @param {Object} competencyData - Competency data
 * @param {string} competencyData.competencyName - Name of the competency (required)
 * @returns {Promise<Object>} Response with created competency data
 */
const createCompetency = async (competencyData) => {
  const response = await api.post(BASE_URL, competencyData)
  return response.data
}

/**
 * Delete a competency
 * 
 * @param {number|string} id - Competency ID
 * @returns {Promise<Object>} Response with success message
 */
const deleteCompetency = async (id) => {
  const response = await api.delete(`${BASE_URL}/${id}`)
  return response.data
}

/**
 * Get competencies summary
 * 
 * @returns {Promise<Object>} Response with summary statistics
 */
const getSummary = async () => {
  const response = await api.get(`${BASE_URL}/summary`)
  return response.data
}

export default {
  getAllCompetencies,
  createCompetency,
  deleteCompetency,
  getSummary,
}
