import api from './api'

// Exit Records
export const listExitRecords = async (params = {}) => {
  const { data } = await api.get('/exit-management', { params })
  return data.data
}

export const getExitRecordStats = async () => {
  const { data } = await api.get('/exit-management/stats')
  return data.data
}

export const getExitRecord = async (id) => {
  const { data } = await api.get(`/exit-management/${id}`)
  return data.data
}

export const createResignation = async (payload) => {
  const { data } = await api.post('/exit-management/resignation', payload)
  return data.data
}

export const createTermination = async (payload) => {
  const { data } = await api.post('/exit-management/termination', payload)
  return data.data
}

export const updateExitRecord = async (id, payload) => {
  const { data } = await api.put(`/exit-management/${id}`, payload)
  return data.data
}

export const approveResignation = async (id) => {
  const { data } = await api.put(`/exit-management/${id}/approve`)
  return data.data
}

export const rejectResignation = async (id, payload) => {
  const { data } = await api.put(`/exit-management/${id}/reject`, payload)
  return data.data
}

export const updateExitStatus = async (id, payload) => {
  const { data } = await api.put(`/exit-management/${id}/status`, payload)
  return data.data
}

// Clearance Tasks
export const listClearanceTasks = async (exitId) => {
  const { data } = await api.get(`/exit-management/${exitId}/clearance`)
  return data.data
}

export const addClearanceTask = async (exitId, payload) => {
  const { data } = await api.post(`/exit-management/${exitId}/clearance`, payload)
  return data.data
}

export const updateClearanceTask = async (exitId, taskId, payload) => {
  const { data } = await api.put(`/exit-management/${exitId}/clearance/${taskId}`, payload)
  return data.data
}

// Asset Returns
export const listAssetReturns = async (exitId) => {
  const { data } = await api.get(`/exit-management/${exitId}/assets`)
  return data.data
}

export const addAssetReturn = async (exitId, payload) => {
  const { data } = await api.post(`/exit-management/${exitId}/assets`, payload)
  return data.data
}

export const updateAssetReturn = async (exitId, assetId, payload) => {
  const { data } = await api.put(`/exit-management/${exitId}/assets/${assetId}`, payload)
  return data.data
}

// Exit Documents
export const listExitDocuments = async (exitId) => {
  const { data } = await api.get(`/exit-management/${exitId}/documents`)
  return data.data
}

export const generateExitDocument = async (exitId, payload) => {
  const { data } = await api.post(`/exit-management/${exitId}/documents/generate`, payload)
  return data.data
}

// Exit Interviews
export const submitExitInterview = async (payload) => {
  const { data } = await api.post('/exit-management/interviews', payload)
  return data.data
}

export const getExitInterview = async (exitRequestId) => {
  const { data } = await api.get(`/exit-management/${exitRequestId}/interview`)
  return data.data
}

// Final Settlements
export const processSettlement = async (payload) => {
  const { data } = await api.post('/exit-management/settlements', payload)
  return data.data
}

export const getSettlement = async (exitRequestId) => {
  const { data } = await api.get(`/exit-management/${exitRequestId}/settlement`)
  return data.data
}

// Audit Logs
export const getAuditLog = async (exitRequestId) => {
  const { data } = await api.get(`/exit-management/${exitRequestId}/audit-log`)
  return data.data
}

// Termination Types (for dropdowns)
export const listTerminationTypesDropdown = async () => {
  const { data } = await api.get('/exit-management/termination-types')
  return data.data
}

// Termination Types Settings CRUD
export const listTerminationTypes = async (params = {}) => {
  const { data } = await api.get('/admin/settings/termination-types', { params })
  return data.data
}

export const getTerminationType = async (id) => {
  const { data } = await api.get(`/admin/settings/termination-types/${id}`)
  return data.data
}

export const createTerminationType = async (payload) => {
  const { data } = await api.post('/admin/settings/termination-types', payload)
  return data.data
}

export const updateTerminationType = async (id, payload) => {
  const { data } = await api.put(`/admin/settings/termination-types/${id}`, payload)
  return data.data
}

export const deleteTerminationType = async (id) => {
  const { data } = await api.delete(`/admin/settings/termination-types/${id}`)
  return data.data
}
