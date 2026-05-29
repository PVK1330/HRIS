import api from './api'

const BASE_URL = '/exit-management/workflows'

export async function listExitWorkflows(params = {}) {
  const { data } = await api.get(BASE_URL, { params })
  return data?.data || []
}

export async function createExitWorkflow(payload) {
  const { data } = await api.post(BASE_URL, payload)
  return data?.data
}

export async function getExitWorkflow(id) {
  const { data } = await api.get(`${BASE_URL}/${id}`)
  return data?.data
}

export async function updateExitWorkflow(id, payload) {
  const { data } = await api.put(`${BASE_URL}/${id}`, payload)
  return data?.data
}

export async function publishExitWorkflow(id) {
  const { data } = await api.put(`${BASE_URL}/${id}/publish`)
  return data?.data
}

export async function cloneExitWorkflow(id) {
  const { data } = await api.post(`${BASE_URL}/${id}/clone`)
  return data?.data
}

export async function deleteExitWorkflow(id) {
  const { data } = await api.delete(`${BASE_URL}/${id}`)
  return data?.data
}

// Deprecated mock functions kept for backward compatibility
export async function listExitWorkflowOrganizations() {
  return { organizations: [], defaultOrganizationId: 'default' }
}
export async function getExitWorkflowSettings() {
  return { steps: [] }
}
export async function updateExitWorkflowSettings() {
  return { steps: [] }
}
