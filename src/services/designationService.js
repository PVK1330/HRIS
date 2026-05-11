import api from './api'

export const listDesignations = async () => {
  const { data } = await api.get('/designations')
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
