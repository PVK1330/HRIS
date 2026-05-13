import api from './api'

/** @returns {Promise<object>} */
export const listDesignations = async (params = {}) => {
  const { data } = await api.get('/designations', { params })
  const p = data.data
  if (p && Array.isArray(p.records)) {
    return {
      ...p,
      designations: p.records,
      total: p.pagination?.total ?? 0,
      page: p.pagination?.page ?? 1,
      limit: p.pagination?.limit ?? 10,
      pages: p.pagination?.totalPages ?? 1,
    }
  }
  if (p && Array.isArray(p.designations)) {
    return {
      ...p,
      records: p.designations,
      pagination: {
        total: p.total ?? p.designations.length,
        page: p.page ?? 1,
        limit: p.limit ?? p.designations.length,
        totalPages: p.pages ?? 1,
        hasNext: false,
        hasPrev: false,
      },
    }
  }
  if (Array.isArray(p)) {
    return {
      records: p,
      designations: p,
      pagination: { total: p.length, page: 1, limit: p.length, totalPages: 1, hasNext: false, hasPrev: false },
      total: p.length,
      page: 1,
      limit: p.length,
      pages: 1,
    }
  }
  return {
    records: [],
    designations: [],
    pagination: { total: 0, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false },
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  }
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
  const { data } = await api.put(`/designations/${id}`, payload)
  return data.data
}

export const deleteDesignation = async (id) => {
  const { data } = await api.delete(`/designations/${id}`)
  return data.data
}
