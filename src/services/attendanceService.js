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
