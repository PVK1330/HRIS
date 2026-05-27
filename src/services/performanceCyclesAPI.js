/**
 * ============================================================================
 * Performance Cycles API Service
 * ============================================================================
 * Frontend service for making API calls to performance cycles backend
 * Provides methods for creating, reading, updating, and deleting cycles
 * 
 * Usage:
 * import performanceCyclesAPI from '@/services/performanceCyclesAPI'
 * 
 * const cycles = await performanceCyclesAPI.getAllCycles({ search: 'Q1' })
 * const cycle = await performanceCyclesAPI.createCycle({ cycleName, startDate, ... })
 * ============================================================================
 */

import api from './api' // Axios API client

const BASE_URL = 'performance-cycles'

/**
 * Get all performance cycles with optional search and filters
 * 
 * @param {Object} options - Query options
 * @param {string} options.search - Search term for cycle name (optional)
 * @param {string} options.status - Filter by status: ACTIVE, UPCOMING, COMPLETED (optional)
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Records per page (default: 10)
 * @returns {Promise<Object>} Response with cycles array and pagination info
 * 
 * Example:
 * const { data } = await performanceCyclesAPI.getAllCycles({ 
 *   search: 'Q1', 
 *   status: 'ACTIVE', 
 *   page: 1, 
 *   limit: 10 
 * })
 */
const getAllCycles = async (options = {}) => {
  const {
    search = '',
    status = null,
    page = 1,
    limit = 10,
  } = options

  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (status) params.append('status', status)
  params.append('page', page)
  params.append('limit', limit)

  const response = await api.get(`${BASE_URL}?${params.toString()}`)
  return response.data
}

/**
 * Get a single performance cycle by ID
 * 
 * @param {number} id - Cycle ID
 * @returns {Promise<Object>} Response with cycle data
 * 
 * Example:
 * const { data } = await performanceCyclesAPI.getCycleById(1)
 */
const getCycleById = async (id) => {
  const response = await api.get(`${BASE_URL}/${id}`)
  return response.data
}

/**
 * Create a new performance cycle
 * 
 * @param {Object} cycleData - Cycle data
 * @param {string} cycleData.cycleName - Name of the cycle (required)
 * @param {string} cycleData.startDate - Start date in ISO format (required)
 * @param {string} cycleData.endDate - End date in ISO format (required)
 * @param {string} cycleData.submissionDeadline - Submission deadline in ISO format (required)
 * @param {boolean} cycleData.automatedReminder - Enable automated reminders (optional, default: false)
 * @returns {Promise<Object>} Response with created cycle data
 * 
 * Example:
 * const { data } = await performanceCyclesAPI.createCycle({
 *   cycleName: 'Q1 2026 Performance Review',
 *   startDate: '2026-01-01T00:00:00Z',
 *   endDate: '2026-03-31T23:59:59Z',
 *   submissionDeadline: '2026-04-15T23:59:59Z',
 *   automatedReminder: true
 * })
 */
const createCycle = async (cycleData) => {
  const response = await api.post(BASE_URL, cycleData)
  return response.data
}

/**
 * Update a performance cycle
 * 
 * @param {number} id - Cycle ID
 * @param {Object} updateData - Data to update (all fields optional)
 * @param {string} updateData.cycleName - Updated cycle name
 * @param {string} updateData.startDate - Updated start date
 * @param {string} updateData.endDate - Updated end date
 * @param {string} updateData.submissionDeadline - Updated submission deadline
 * @param {boolean} updateData.automatedReminder - Updated reminder setting
 * @returns {Promise<Object>} Response with updated cycle data
 * 
 * Example:
 * const { data } = await performanceCyclesAPI.updateCycle(1, {
 *   cycleName: 'Q1 2026 Performance Appraisal',
 *   automatedReminder: false
 * })
 */
const updateCycle = async (id, updateData) => {
  const response = await api.put(`${BASE_URL}/${id}`, updateData)
  return response.data
}

/**
 * Delete a performance cycle
 * 
 * @param {number} id - Cycle ID
 * @returns {Promise<Object>} Response with deleted cycle data
 * 
 * Example:
 * const { data } = await performanceCyclesAPI.deleteCycle(1)
 */
const deleteCycle = async (id) => {
  const response = await api.delete(`${BASE_URL}/${id}`)
  return response.data
}

/**
 * Get performance cycles summary
 * 
 * @returns {Promise<Object>} Response with summary statistics
 * Returns:
 * {
 *   activeCycles: number,
 *   upcomingCycles: number,
 *   completedCycles: number
 * }
 * 
 * Example:
 * const { data } = await performanceCyclesAPI.getSummary()
 * console.log(data.activeCycles) // 3
 * console.log(data.upcomingCycles) // 2
 * console.log(data.completedCycles) // 1
 */
const getSummary = async () => {
  const response = await api.get(`${BASE_URL}/summary`)
  return response.data
}

export default {
  getAllCycles,
  getCycleById,
  createCycle,
  updateCycle,
  deleteCycle,
  getSummary,
}
