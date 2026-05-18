import api from './api.js'

export async function listVisaTypes(params = {}) {
  const { data } = await api.get('/visa-types', { params })
  return data.data
}

export async function createVisaType(payload) {
  const { data } = await api.post('/visa-types', payload)
  return data.data
}

export async function updateVisaType(id, payload) {
  const { data } = await api.put(`/visa-types/${id}`, payload)
  return data.data
}

export async function deleteVisaType(id) {
  const { data } = await api.delete(`/visa-types/${id}`)
  return data.data
}
