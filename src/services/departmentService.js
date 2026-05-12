import api from './api'

/** @returns {Promise<{ departments: Array, total: number, page: number, limit: number, pages: number } | { departments: Array }>} */
export const listDepartments = async (params = {}) => {
  const { data } = await api.get('/departments', { params })
  const payload = data.data
  if (payload && Array.isArray(payload.departments)) return payload
  if (Array.isArray(payload)) {
    return { departments: payload, total: payload.length, page: 1, limit: payload.length, pages: 1 }
  }
  return { departments: [], total: 0, page: 1, limit: 20, pages: 1 }
}

export const listDepartmentManagers = async () => {
  const { data } = await api.get('/departments/managers')
  return data.data
}

export const getDepartment = async (id) => {
  const { data } = await api.get(`/departments/${id}`)
  return data.data
}

export const createDepartment = async (deptData) => {
  const { data } = await api.post('/departments', deptData)
  return data.data
}

export const updateDepartment = async (id, deptData) => {
  const { data } = await api.patch(`/departments/${id}`, deptData)
  return data.data
}

export const deleteDepartment = async (id) => {
  const { data } = await api.delete(`/departments/${id}`)
  return data.data
}
