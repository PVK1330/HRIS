import api from './api'

/** @returns {Promise<{ designations: Array, total: number, page: number, limit: number, pages: number }>} */
export const listDesignations = async (params = {}) => {
  const { data } = await api.get('/designations', { params })
  const payload = data.data
  if (payload && Array.isArray(payload.designations)) return payload
  if (Array.isArray(payload)) {
    return { designations: payload, total: payload.length, page: 1, limit: payload.length, pages: 1 }
  }
  return { designations: [], total: 0, page: 1, limit: 20, pages: 1 }
}

/** Active designations for a department name (Employee Directory). */
export const listDesignationsByDepartment = async (departmentName) => {
  const enc = encodeURIComponent(String(departmentName || '').trim())
  const { data } = await api.get(`/designations/by-department/${enc}`)
  return data.data
}

export const getDesignation = async (id) => {
  const { data } = await api.get(`/designations/${id}`)
  return data.data
}

export const createDesignation = async (payload) => {
  const { data } = await api.post('/designations', payload)
  return data.data
}

export const updateDesignation = async (id, payload) => {
  const { data } = await api.patch(`/designations/${id}`, payload)
  return data.data
}

export const deleteDesignation = async (id) => {
  const { data } = await api.delete(`/designations/${id}`)
  return data.data
}
