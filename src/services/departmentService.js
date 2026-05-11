import api from './api'

export const listDepartments = async () => {
  const { data } = await api.get('/departments')
  return data.data
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
