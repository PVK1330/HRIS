import api from './api.js'

const BASE = '/attendance'

export const listAttendance = async (params = {}) => {
  const { data } = await api.get(BASE, { params })
  return data.data
}

export const markAttendance = async (payload) => {
  const { data } = await api.post(BASE, payload)
  return data.data.record
}

export const markAttendanceOverride = async (payload) => {
  const { data } = await api.post(`${BASE}/override`, payload)
  return data.data.record
}

export const getAttendanceDetail = async (id) => {
  const { data } = await api.get(`${BASE}/${id}`)
  return data.data
}

export const checkIn = async (payload = {}) => {
  const { data } = await api.post(`${BASE}/check-in`, payload)
  return data.data.record
}

export const checkOut = async (payload = {}) => {
  const { data } = await api.post(`${BASE}/check-out`, payload)
  return data.data.record
}

export const getMyToday = async () => {
  const { data } = await api.get(`${BASE}/me/today`)
  return data.data
}

export const getAttendanceDashboard = async (params = {}) => {
  const { data } = await api.get(`${BASE}/dashboard`, { params })
  return data.data
}

export const submitRegularization = async (payload) => {
  const { data } = await api.post(`${BASE}/regularization`, payload)
  return data.data.record
}

export const getPendingRegularizations = async (params = {}) => {
  const { data } = await api.get(`${BASE}/regularizations`, { params })
  return data.data
}

export const getRegularizationHistory = async (params = {}) => {
  const { data } = await api.get(`${BASE}/regularizations/history`, { params })
  return data.data
}

export const regularize = async (id, payload) => {
  const { data } = await api.patch(`${BASE}/${id}/regularize`, payload)
  return data.data.record
}

export const getPendingOvertime = async (params = {}) => {
  const { data } = await api.get(`${BASE}/overtime/pending`, { params })
  return data.data
}

// All overtime records (history) for the Overtime Management page. Optional { status, search }.
export const getOvertimeRecords = async (params = {}) => {
  const { data } = await api.get(`${BASE}/overtime`, { params })
  return data.data
}

// action: 'approve' | 'reject'  (reject may include a reason)
export const processOvertime = async (id, payload) => {
  const { data } = await api.patch(`${BASE}/${id}/overtime`, payload)
  return data.data.record
}

// Manually add an overtime entry: { employeeId, date, overtimeHours, description?, status? }
export const addOvertime = async (payload) => {
  const { data } = await api.post(`${BASE}/overtime`, payload)
  return data.data.record
}

// Edit a Pending overtime entry: { overtimeHours?, description? }
export const updateOvertime = async (id, payload) => {
  const { data } = await api.patch(`${BASE}/overtime/${id}`, payload)
  return data.data.record
}

// Delete a Pending overtime entry
export const deleteOvertime = async (id) => {
  const { data } = await api.delete(`${BASE}/overtime/${id}`)
  return data.data
}

export const getPayrollSummary = async (params) => {
  const { data } = await api.get(`${BASE}/payroll-summary`, { params })
  return data.data
}

export const getAttendanceReport = async (params = {}) => {
  const { data } = await api.get(`${BASE}/reports/data`, { params })
  return data.data
}

export const exportAttendancePdf = async (params = {}) => {
  const res = await api.get(`${BASE}/reports/export/pdf`, {
    params,
    responseType: 'blob',
  })
  return res.data
}

export const exportAttendanceExcel = async (params = {}) => {
  const res = await api.get(`${BASE}/reports/export/excel`, {
    params,
    responseType: 'blob',
  })
  return res.data
}

export const getEmployeeAttendance = async (employeeId, params = {}) => {
  const { data } = await api.get(`/employees/${employeeId}/attendance`, { params })
  return data.data
}
