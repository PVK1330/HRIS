import api from './api'

/** @returns {Promise<object>} */
export const listDepartments = async (params = {}) => {
  const { data } = await api.get('/departments', { params })
  const p = data.data
  if (p && Array.isArray(p.records)) {
    return {
      ...p,
      departments: p.records,
      total: p.pagination?.total ?? 0,
      page: p.pagination?.page ?? 1,
      limit: p.pagination?.limit ?? 10,
      pages: p.pagination?.totalPages ?? 1,
    }
  }
  if (p && Array.isArray(p.departments)) {
    return {
      ...p,
      records: p.departments,
      pagination: {
        total: p.total ?? p.departments.length,
        page: p.page ?? 1,
        limit: p.limit ?? p.departments.length,
        totalPages: p.pages ?? 1,
        hasNext: false,
        hasPrev: false,
      },
    }
  }
  if (Array.isArray(p)) {
    return {
      records: p,
      departments: p,
      pagination: { total: p.length, page: 1, limit: p.length, totalPages: 1, hasNext: false, hasPrev: false },
      total: p.length,
      page: 1,
      limit: p.length,
      pages: 1,
    }
  }
  return {
    records: [],
    departments: [],
    pagination: { total: 0, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false },
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  }
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
  const { data } = await api.put(`/departments/${id}`, deptData)
  return data.data
}

export const deleteDepartment = async (id) => {
  const { data } = await api.delete(`/departments/${id}`)
  return data.data
}
